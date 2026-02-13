"use server";

import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { parseError } from "@/lib/error/parse";

export const describeAction = async (
  url: string
): Promise<
  | {
      description: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const { text } = await generateText({
      model: gateway("openai/gpt-5-nano"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image." },
            {
              type: "image",
              image: url,
            },
          ],
        },
      ],
    });

    if (!text) {
      throw new Error("No description found");
    }

    return {
      description: text,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
