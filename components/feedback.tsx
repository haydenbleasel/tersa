import { sendFeedback } from '@/app/actions/feedback/send';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/hooks/use-user';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type FeedbackProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Feedback = ({ open, setOpen }: FeedbackProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const user = useUser();

  const handleSendFeedback: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (!message.trim() || !user) {
      return;
    }

    setIsSending(true);

    try {
      const response = await sendFeedback(
        user.user_metadata.name ?? user.email ?? 'Unknown user',
        user.id,
        message
      );

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Feedback sent successfully');
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
          <DialogDescription>Send feedback to the team.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSendFeedback}
          className="mt-2 grid gap-4"
          aria-disabled={isSending}
        >
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="What's on your mind?"
              value={message}
              onChange={({ target }) => setMessage(target.value)}
              className="text-foreground"
            />
          </div>
          <Button type="submit" disabled={isSending || !message.trim()}>
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
