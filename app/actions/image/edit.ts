"use server";

import { gateway } from "@ai-sdk/gateway";
import { put } from "@vercel/blob";
import { generateImage } from "ai";
import { nanoid } from "nanoid";
import { parseError } from "@/lib/error/parse";

interface EditImageActionProps {
  images: {
    url: string;
    type: string;
  }[];
  modelId: string;
  instructions?: string;
}

export const editImageAction = async ({
  images,
  instructions,
  modelId,
}: EditImageActionProps): Promise<
  | {
      url: string;
      type: string;
      description: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const defaultPrompt =
      images.length > 1
        ? "Create a variant of the image."
        : "Create a single variant of the images.";

    const prompt =
      !instructions || instructions === "" ? defaultPrompt : instructions;

    const imageData = await Promise.all(
      images.map(async (img) => {
        const response = await fetch(img.url);
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      })
    );

    const result = await generateImage({
      model: gateway.imageModel(modelId),
      prompt: {
        images: imageData,
        text: prompt,
      },
    });

    const { image } = result;

    const blob = await put(
      `${nanoid()}.png`,
      Buffer.from(image.base64, "base64"),
      {
        access: "public",
        contentType: "image/png",
      }
    );

    return {
      url: blob.url,
      type: "image/png",
      description: instructions ?? defaultPrompt,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
