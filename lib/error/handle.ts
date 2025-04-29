import { toast } from 'sonner';
import { parseError } from './parse';

export const handleError = (title: string, error: unknown) => {
  const description = parseError(error);

  toast.error(title, { description });
};
