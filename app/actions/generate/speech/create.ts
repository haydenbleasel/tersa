'use server';

import { parseError } from '@/lib/error/parse';
import { getSubscribedUser } from '@/lib/protect';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { nanoid } from 'nanoid';

export const generateSpeechAction = async (
  text: string
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

    const { audio } = await generateSpeech({
      model: openai.speech('gpt-4o-mini-tts'),
      text,
      outputFormat: 'mp3',
    });

    const blob = await client.storage
      .from('files')
      .upload(`${user.id}/${nanoid()}`, new Blob([audio.uint8Array]), {
        contentType: audio.mimeType,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from('files')
      .getPublicUrl(blob.data.path);

    return { url: downloadUrl.publicUrl, type: 'audio/mpeg' };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
