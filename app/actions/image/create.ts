"use server";

import { gateway } from "@ai-sdk/gateway";
import { generateImage, generateText } from "ai";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { parseError } from "@/lib/error/parse";

type GenerateImageActionProps = {
  prompt: string;
  modelId: string;
  instructions?: string;
};

export const generateImageAction = async ({
  prompt,
  modelId,
  instructions,
}: GenerateImageActionProps): Promise<
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
    const result = await generateImage({
      model: gateway.imageModel(modelId),
      prompt: [
        "Generate an image based on the following instructions and context.",
        "---",
        "Instructions:",
        instructions ?? "None.",
        "---",
        "Context:",
        prompt,
      ].join("\n"),
    });

    const { image } = result;

    let extension = image.mediaType.split("/").pop();

    if (extension === "jpeg") {
      extension = "jpg";
    }

    const name = `${nanoid()}.${extension}`;

    const blob = await put(name, image.uint8Array, {
      access: "public",
      contentType: image.mediaType,
    });

    const { text: description } = await generateText({
      model: gateway("openai/gpt-5-nano"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image." },
            {
              type: "image",
              image: blob.url,
            },
          ],
        },
      ],
    });

    if (!description) {
      throw new Error("No description found");
    }

    return {
      url: blob.url,
      type: image.mediaType,
      description,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
