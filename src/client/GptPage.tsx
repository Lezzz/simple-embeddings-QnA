import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@wasp/queries';
import { RelatedObject } from '@wasp/entities';
import generateGptResponse from '@wasp/actions/generateGptResponse';
import searchEmbeddings from '@wasp/queries/searchEmbeddings';

export default function GptPage() {
  const [command, setCommand] = useState<string>('');
  const [response, setResponse] = useState<string>('');

const { data: contextFromEmbeddings, refetch: refetchEmbeddings } = useQuery(
  searchEmbeddings,
  { inputQuery: command, resultNum: 3 },
  { enabled: false }
);

  useEffect(() => {
    const fetchGptResponse = async () => {
      if (contextFromEmbeddings) {
        const instructions = `Esti un functionar public de la permise auto. Folosind informatiile de mai jos, răspunde la întrebarea: "${command}".\n\nInformatii Aditionale:\n${contextFromEmbeddings}`;
        try {
          const response = (await generateGptResponse({ instructions, command })) as RelatedObject;
          if (response) {
            setResponse(response.content);
          }
        } catch (e) {
          alert('Something went wrong. Please try again.');
          console.error(e);
        }
      }
    };

    fetchGptResponse();
  }, [contextFromEmbeddings, command]);

  const onSubmit = async (formData: any) => {
    setCommand(formData.command);
    refetchEmbeddings();
  };
  

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors: formErrors, isSubmitting },
  } = useForm();


  return (
    <div className='mt-10 px-6'>
      <div className='overflow-hidden bg-white ring-1 ring-gray-900/10 shadow-lg sm:rounded-lg lg:m-8'>
        <div className='m-4 py-4 sm:px-6 lg:px-8'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-6 sm:w-[90%] md:w-[60%] mx-auto border-b border-gray-900/10 px-6 pb-12'>
              <div className='col-span-full'>
                <label htmlFor='command' className='block text-sm font-medium leading-6 text-gray-900'>
                  Pune o întrebare:
                </label>
                <div className='mt-2'>
                  <textarea
                    id='command'
                    placeholder='Ce acte am nevoie pentru a obține un buletin în Brașov?'
                    rows={3}
                    className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6'
                    defaultValue={''}
                    {...register('command', {
                      required: 'Completează aici',
                      minLength: {
                        value: 5,
                        message: 'Minim 5 caractere',
                      },
                    })}
                  />
                </div>
                <span className='text-sm text-red-500'>{formErrors.command && formErrors.command.message}</span>
              </div>
            <div className='mt-6 flex justify-end gap-x-6 sm:w-[90%] md:w-[50%] mx-auto'>
              <button
                type='submit'
                className={`${
                  isSubmitting && 'animate-puls'
                } rounded-md bg-blue-500 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              >
                {!isSubmitting ? 'Întreabă' : 'Loading...'}
              </button>
              </div>
            </div>
          </form>
          <div
            className={`${
              isSubmitting && 'animate-pulse'
            } mt-2 mx-6 flex justify-center rounded-lg border border-dashed border-gray-900/25 mt-10 sm:w-[90%] md:w-[50%] mx-auto mt-12 px-6 py-10`}
          >
            <div className='space-y-2 text-center'>
              <p className='text-sm text-gray-500'>{response ? response : 'Răspunsul se va încărca aici.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
