"use server";

import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as transcribe } from "ai";
import { getSubscribedUser } from "@/lib/auth";
import { parseError } from "@/lib/error/parse";

export const transcribeAction = async (
  url: string,
  _projectId: string
): Promise<
  | {
      transcript: string;
    }
  | {
      error: string;
    }
> => {
  try {
    await getSubscribedUser();

    const transcript = await transcribe({
      model: openai.transcription("gpt-4o-mini-transcribe"),
      audio: new URL(url),
    });

    return {
      transcript: transcript.text,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
