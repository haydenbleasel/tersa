import { useProject } from '@/providers/project';
import { Panel } from '@xyflow/react';
import { CheckIcon, Loader2Icon } from 'lucide-react';

type SaveIndicatorProps = {
  lastSaved: Date | null;
  saving: boolean;
};

const getFormattedTime = (date: Date) => {
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

export const SaveIndicator = ({ lastSaved, saving }: SaveIndicatorProps) => {
  const { project } = useProject();
  const date = lastSaved ?? project?.updatedAt ?? project?.createdAt;

  return (
    <Panel
      position="bottom-right"
      className="m-4 flex items-center gap-1 rounded-full border bg-card/90 p-3 drop-shadow-xs backdrop-blur-sm"
    >
      {date && (
        <span className="mx-1 hidden text-muted-foreground text-sm sm:block">
          Last saved: {getFormattedTime(date)}
        </span>
      )}
      {saving && (
        <Loader2Icon size={16} className="animate-spin text-primary" />
      )}
      {!saving && date && <CheckIcon size={16} className="text-primary" />}
    </Panel>
  );
};
