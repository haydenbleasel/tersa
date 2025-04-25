'use server';

import { imageModels } from '@/lib/models';
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

    const client = await createClient();
    const { data } = await client.auth.getUser();

    if (!data?.user) {
      throw new Error('User not found');
    }

    const blob = await client.storage
      .from(data.user.id)
      .upload(nanoid(), new Blob([image.uint8Array]), {
        contentType: image.mimeType,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from(data.user.id)
      .getPublicUrl(blob.data.path);

    return { url: downloadUrl.publicUrl, type: image.mimeType };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
