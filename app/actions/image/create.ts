'use server';

import { parseError } from '@/lib/error/parse';
import { imageModels } from '@/lib/models';
import { getSubscribedUser } from '@/lib/protect';
import { createClient } from '@/lib/supabase/server';
import { experimental_generateImage as generateImage } from 'ai';
import { nanoid } from 'nanoid';

export const generateImageAction = async (
  prompt: string,
  modelId: string,
  instructions?: string
): Promise<
  | {
      url: string;
      type: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const client = await createClient();
    const user = await getSubscribedUser();

    const model = imageModels
      .flatMap((m) => m.models)
      .find((m) => m.id === modelId)?.model;

    if (!model) {
      throw new Error('Model not found');
    }

    const { image } = await generateImage({
      model,
      prompt: [
        'Generate an image based on the following instructions and context.',
        '---',
        'Instructions:',
        instructions ?? 'None.',
        '---',
        'Context:',
        prompt,
      ].join('\n'),
    });

    const blob = await client.storage
      .from('files')
      .upload(`${user.id}/${nanoid()}`, new Blob([image.uint8Array]), {
        contentType: image.mimeType,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from('files')
      .getPublicUrl(blob.data.path);

    return { url: downloadUrl.publicUrl, type: image.mimeType };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
