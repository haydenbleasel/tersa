"use server";

import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { parseError } from "@/lib/error/parse";
import { videoModels } from "@/lib/models/video";

type GenerateVideoActionProps = {
  modelId: string;
  prompt: string;
  images: {
    url: string;
    type: string;
  }[];
};

export const generateVideoAction = async ({
  modelId,
  prompt,
  images,
}: GenerateVideoActionProps): Promise<
  | {
      url: string;
      type: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const model = videoModels[modelId];

    if (!model) {
      throw new Error("Model not found");
    }

    const provider = model.providers[0];

    const firstFrameImage = images.at(0)?.url;

    const url = await provider.model.generate({
      prompt,
      imagePrompt: firstFrameImage,
      duration: 5,
      aspectRatio: "16:9",
    });

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const blob = await put(`${nanoid()}.mp4`, arrayBuffer, {
      access: "public",
      contentType: "video/mp4",
    });

    return {
      url: blob.url,
      type: "video/mp4",
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
