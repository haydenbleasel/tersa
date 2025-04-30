import { Tweet } from 'react-tweet';

type TweetsProps = {
  ids: string[];
};

export const Tweets = ({ ids }: TweetsProps) => (
  <div className="grid gap-4 px-4 sm:grid-cols-3 sm:px-8 [&>div]:m-0!">
    {ids.map((id) => (
      <Tweet key={id} id={id} />
    ))}
  </div>
);
