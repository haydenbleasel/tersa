"use server";

import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { getSubscribedUser } from "@/lib/auth";
import { parseError } from "@/lib/error/parse";

export const describeAction = async (
  url: string,
  projectId: string
): Promise<
  | {
      description: string;
    }
  | {
      error: string;
    }
> => {
  try {
    await getSubscribedUser();

    let parsedUrl = url;

    if (process.env.NODE_ENV !== "production") {
      const response = await fetch(url);
      const blob = await response.blob();

      parsedUrl = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`;
    }

    const { text } = await generateText({
      model: gateway("openai/gpt-5-nano"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image." },
            {
              type: "image",
              image: parsedUrl,
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
