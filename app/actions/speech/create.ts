"use server";

import { experimental_generateSpeech as generateSpeech } from "ai";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { parseError } from "@/lib/error/parse";
import { speechModels } from "@/lib/models/speech";

type GenerateSpeechActionProps = {
  text: string;
  modelId: string;
  instructions?: string;
  voice?: string;
};

export const generateSpeechAction = async ({
  text,
  modelId,
  instructions,
  voice,
}: GenerateSpeechActionProps): Promise<
  | {
      url: string;
      type: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const model = speechModels[modelId];

    if (!model) {
      throw new Error("Model not found");
    }

    const provider = model.providers[0];

    const { audio } = await generateSpeech({
      model: provider.model,
      text,
      outputFormat: "mp3",
      instructions,
      voice,
    });

    const blob = await put(`${nanoid()}.mp3`, audio.uint8Array, {
      access: "public",
      contentType: audio.mediaType,
    });

    return {
      url: blob.url,
      type: audio.mediaType,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
