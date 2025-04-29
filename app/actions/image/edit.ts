'use server';

import { getSubscribedUser } from '@/lib/protect';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import OpenAI, { toFile } from 'openai';

export const editImageAction = async (
  images: {
    url: string;
    type: string;
  }[],
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

    const openai = new OpenAI();

    const promptImages = await Promise.all(
      images.map(async (image) => {
        const response = await fetch(image.url);
        const blob = await response.blob();

        return toFile(blob, nanoid(), {
          type: image.type,
        });
      })
    );

    const defaultPrompt =
      images.length > 1
        ? 'Create a variant of the image.'
        : 'Create a single variant of the images.';

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: promptImages,
      prompt: instructions ?? defaultPrompt,
      user: user.id,
    });

    const json = response.data?.at(0)?.b64_json;

    if (!json) {
      throw new Error('No url found');
    }

    const bytes = Buffer.from(json, 'base64');
    const filename = nanoid();
    const contentType = 'image/png';

    const blob = await client.storage.from(user.id).upload(filename, bytes, {
      contentType,
    });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from(user.id)
      .getPublicUrl(blob.data.path);

    return {
      url: downloadUrl.publicUrl,
      type: contentType,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
