'use server';

import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { nanoid } from 'nanoid';

export const generateSpeechAction = async (
  text: string
): Promise<
  | {
      url: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const { audio } = await generateSpeech({
      model: openai.speech('gpt-4o-mini-tts'),
      text,
      outputFormat: 'mp3',
    });

    const client = await createClient();
    const { data } = await client.auth.getUser();

    if (!data?.user) {
      throw new Error('User not found');
    }

    const blob = await client.storage
      .from(data.user.id)
      .upload(nanoid(), new Blob([audio.uint8Array]), {
        contentType: audio.mimeType,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from(data.user.id)
      .getPublicUrl(blob.data.path);

    return { url: downloadUrl.publicUrl };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
