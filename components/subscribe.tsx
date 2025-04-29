import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SubscribeProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Subscribe = ({ open, setOpen }: SubscribeProps) => {
  // TBD.

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscribe</DialogTitle>
          <DialogDescription>
            Choose a plan to get access to all features.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
