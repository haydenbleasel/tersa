"use server";

import { getTweet } from "react-tweet/api";
import { parseError } from "@/lib/error/parse";

export const getTweetData = async (
  tweetId: string
): Promise<
  | {
      text: string;
      author: string;
      date: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const tweet = await getTweet(tweetId);

    if (!tweet) {
      throw new Error("Tweet not found");
    }

    return {
      text: tweet.text,
      author: tweet.user.name,
      date: tweet.created_at,
    };
  } catch (error) {
    const message = parseError(error);

    return {
      error: message,
    };
  }
};
