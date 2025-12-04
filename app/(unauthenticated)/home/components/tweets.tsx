import { Tweet } from "react-tweet";

type TweetsProps = {
  ids: string[];
};

export const Tweets = ({ ids }: TweetsProps) => (
  <div className="grid gap-4 px-4 sm:px-8 md:grid-cols-2 lg:grid-cols-3 [&>div]:m-0!">
    {ids.map((id) => (
      <Tweet id={id} key={id} />
    ))}
  </div>
);
