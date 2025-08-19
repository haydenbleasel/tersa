import { getTweetData } from '@/app/actions/tweet/get';
import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { handleError } from '@/lib/error/handle';
import { cn } from '@/lib/utils';
import { useReactFlow } from '@xyflow/react';
import { Loader2Icon } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { Tweet } from 'react-tweet';
import type { TweetNodeProps } from '.';

type TweetPrimitiveProps = TweetNodeProps & {
  title: string;
};

export const TweetPrimitive = ({
  data,
  id,
  type,
  title,
}: TweetPrimitiveProps) => {
  const [tweetId, setTweetId] = useState('');
  const { updateNodeData } = useReactFlow();
  const [loading, setLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!tweetId || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await getTweetData(tweetId);
      if ('error' in response) {
        throw new Error(response.error);
      }

      updateNodeData(id, {
        content: {
          id: tweetId,
          text: response.text,
          author: response.author,
          date: response.date,
        },
      });
    } catch (error) {
      handleError('Error fetching tweet', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NodeLayout id={id} data={data} type={type} title={title}>
      {data.content?.id ? (
        <div
          className={cn(
            '[&_.react-tweet-theme]:m-0!',
            '[&_.react-tweet-theme]:rounded-3xl!'
          )}
        >
          <Tweet id={data.content.id} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1">
          <Input
            type="text"
            placeholder="Tweet ID"
            value={tweetId}
            onChange={({ target }) => setTweetId(target.value)}
            className="rounded-full"
          />
          <Button type="submit" className="rounded-full" disabled={loading}>
            {loading ? <Loader2Icon className="animate-spin" /> : 'Submit'}
          </Button>
        </form>
      )}
    </NodeLayout>
  );
};
