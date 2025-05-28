'use client';

import { useSaveProject } from '@/hooks/use-save-project';
import { cn } from '@/lib/utils';
import { useProject } from '@/providers/project';
import { Panel } from '@xyflow/react';
import { CheckIcon, Loader2Icon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const getFormattedTime = (date: Date | undefined) => {
  if (!date) {
    return 'Never';
  }

  let unit: Intl.RelativeTimeFormatUnit = 'seconds';
  let value = Math.round((date.getTime() - Date.now()) / 1000);
  const absoluteValue = Math.abs(value);

  if (absoluteValue > 60) {
    unit = 'minutes';
    value = Math.round(value / 60);
  }

  if (absoluteValue > 3600) {
    unit = 'hours';
    value = Math.round(value / 60);
  }

  if (absoluteValue > 86400) {
    unit = 'days';
    value = Math.round(value / 24);
  }

  if (absoluteValue > 604800) {
    unit = 'weeks';
    value = Math.round(value / 7);
  }

  if (absoluteValue > 2592000) {
    unit = 'months';
    value = Math.round(value / 4);
  }

  if (absoluteValue > 31536000) {
    unit = 'years';
    value = Math.round(value / 12);
  }

  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    value,
    unit
  );
};

export const SaveIndicator = () => {
  const project = useProject();
  const [{ isSaving, lastSaved }] = useSaveProject();

  return (
    <Panel
      position="bottom-right"
      className={cn(
        'm-4 flex max-w-[46px] items-center justify-end gap-1 overflow-hidden whitespace-nowrap rounded-full border bg-card/90 p-3 drop-shadow-xs backdrop-blur-sm',
        'hover:max-w-none'
      )}
    >
      <Tooltip>
        <TooltipTrigger>
          {isSaving ? (
            <Loader2Icon
              size={16}
              className="shrink-0 animate-spin text-primary"
            />
          ) : (
            <CheckIcon size={16} className="shrink-0 text-primary" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          Last saved{' '}
          {getFormattedTime(
            lastSaved ?? project?.updatedAt ?? project?.createdAt
          )}
        </TooltipContent>
      </Tooltip>
    </Panel>
  );
};
