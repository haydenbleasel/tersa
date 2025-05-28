'use client';

import { useReasoning } from '@/hooks/use-reasoning';
import { ReasoningTunnel } from '@/tunnels/reasoning';
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

export const Reasoning = () => {
  const [reasoning, setReasoning] = useReasoning();

  const handleClose = () => {
    setReasoning({ isReasoning: false, isGenerating: false });
  };

  return (
    <motion.div
      className="w-sm overflow-auto border-l bg-background"
      initial={{ width: '0' }}
      animate={{ width: reasoning.isReasoning ? '24rem' : '0' }}
    >
      <div className="flex size-full flex-col divide-y">
        <div className="sticky top-0 flex items-center justify-between gap-4 bg-background px-4 py-2">
          <div className="flex items-center gap-2">
            {reasoning.isGenerating ? (
              <Loader2Icon className="size-4 animate-spin text-primary" />
            ) : (
              <CheckIcon className="size-4 text-primary" />
            )}
            <p className="font-semibold text-sm">Reasoning</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <XIcon className="size-3 text-muted-foreground" />
          </Button>
        </div>
        <div className="whitespace-break-spaces p-4 text-sm leading-normal">
          <ReasoningTunnel.Out />
        </div>
      </div>
    </motion.div>
  );
};
