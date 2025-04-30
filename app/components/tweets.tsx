import { Tweet } from 'react-tweet';

type TweetsProps = {
  ids: string[];
};

export const Tweets = ({ ids }: TweetsProps) => (
  <div className="grid grid-cols-3 gap-4 [&>div]:m-0!">
    {ids.map((id) => (
      <Tweet key={id} id={id} />
    ))}
  </div>
);
