"use server";

import { gateway } from "@ai-sdk/gateway";
import { experimental_generateVideo as generateVideo } from "ai";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { parseError } from "@/lib/error/parse";

type GenerateVideoActionProps = {
  modelId: string;
  prompt: string;
  image?: string;
};

export const generateVideoAction = async ({
  modelId,
  prompt,
  image,
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
    const result = await generateVideo({
      model: gateway.videoModel(modelId),
      prompt: image ? { image, text: prompt } : prompt,
    });

    const blob = await put(`${nanoid()}.mp4`, result.video.uint8Array.buffer as ArrayBuffer, {
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
