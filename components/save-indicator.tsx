import { Panel } from '@xyflow/react';
import { CheckIcon, Loader2Icon } from 'lucide-react';

type SaveIndicatorProps = {
  lastSaved: Date;
  saving: boolean;
};

const getFormattedTime = (millisecondsAgo: number) => {
  let unit: Intl.RelativeTimeFormatUnit = 'seconds';
  let value = Math.round((millisecondsAgo - Date.now()) / 1000);

  if (value > 60) {
    unit = 'minutes';
    value = Math.round(value / 60);
  }

  if (value > 60) {
    unit = 'hours';
    value = Math.round(value / 60);
  }

  if (value > 24) {
    unit = 'days';
    value = Math.round(value / 24);
  }

  if (value > 7) {
    unit = 'weeks';
    value = Math.round(value / 7);
  }

  if (value > 4) {
    unit = 'months';
    value = Math.round(value / 4);
  }

  if (value > 12) {
    unit = 'years';
    value = Math.round(value / 12);
  }

  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    value,
    unit
  );
};

export const SaveIndicator = ({ lastSaved, saving }: SaveIndicatorProps) => (
  <Panel
    position="bottom-right"
    className="flex items-center gap-1 rounded-full border bg-card/90 p-3 drop-shadow-xs backdrop-blur-sm"
  >
    {lastSaved && (
      <span className="mx-1 hidden text-muted-foreground text-sm sm:block">
        Last saved: {getFormattedTime(lastSaved.getTime())}
      </span>
    )}
    {saving && <Loader2Icon size={16} className="animate-spin text-primary" />}
    {!saving && lastSaved && <CheckIcon size={16} className="text-primary" />}
  </Panel>
);
