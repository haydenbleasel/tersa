import { TweetPrimitive } from "./primitive";

export type TweetNodeProps = {
  type: string;
  data: {
    content?: {
      id: string;
      text: string;
      author: string;
      date: string;
    };
    updatedAt?: string;
  };
  id: string;
};

export const TweetNode = (props: TweetNodeProps) => (
  <TweetPrimitive {...props} title="Tweet" />
);
