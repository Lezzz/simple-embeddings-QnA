import { openai } from './utils.js';
import prismaClient from '@wasp/dbClient.js';
import { initPinecone } from './utils.js';
import type { Text } from '@wasp/entities';
import type { SearchEmbeddings } from '@wasp/queries/types';

type Args = { inputQuery: string, resultNum: number };

export const searchEmbeddings: SearchEmbeddings<Args, string> = async ({ inputQuery, resultNum = 3 }, context) => {
  const pinecone = await initPinecone();

  try {
    const res = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: inputQuery,
    });

    const embedding = res.data.data[0].embedding;

    const indexes = await pinecone.listIndexes();
    console.log('indexes-->>', indexes);

    const index = pinecone.Index('embeds-test');

    const queryRequest = {
      vector: embedding,
      topK: resultNum,
      includeValues: false,
      includeMetadata: false,
    };

    let queryResponse;
    try {
      queryResponse = await index.query({ queryRequest });
    } catch (err) {
      console.error("Pinecone query error: ", err);
      throw err;
    }

    let matches: Text[] = [];
    if (queryResponse.matches?.length) {
      const textChunks = await Promise.all(
        queryResponse.matches.map(async (match) => {
          return await context.entities.Text.findFirst({
            where: {
              title: match.id,
            },
          });
        })
      );
      matches = textChunks.filter((textChunk) => !!textChunk) as Text[];

      // Join the content of the matches into a single string
      const joinedMatches = matches.map(textChunk => textChunk.content).join('\n');
      return joinedMatches;
    }

    // Return an empty string if there are no matches
    return '';
  } catch (err) {
    console.error("Error in searchEmbeddings: ", err);
    throw err; // Rethrow the error to make sure the calling function knows something went wrong.
  }
};
