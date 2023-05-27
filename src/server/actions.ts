import fetch from 'node-fetch';
import HttpError from '@wasp/core/HttpError.js';
import type { RelatedObject } from '@wasp/entities';
import type { GenerateGptResponse } from '@wasp/actions/types';
import type { OpenAIResponse } from './types';

type GptPayload = {
    instructions: string;
    command: string;
};

export const generateGptResponse: GenerateGptResponse<GptPayload, RelatedObject> = async (
    { instructions, command },
    context
  ) => {
    if (!context.user) {
      throw new HttpError(401);
    }
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: instructions,
        },
        {
          role: 'user',
          content: command,
        },
      ],
    };

    try {
        console.log('fetching', payload);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
            },
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const json = (await response.json()) as OpenAIResponse;
        console.log('response json', json);
        return context.entities.RelatedObject.create({
            data: {
                content: json?.choices[0].message.content,
                user: { connect: { id: context.user.id } },
            },
        });
    } catch (error: any) {
        console.error(error);
    }

    return new Promise((resolve, reject) => {
        reject(new HttpError(500, 'Something went wrong'));
    });
};
