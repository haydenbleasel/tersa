import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/kibo-ui/combobox';
import { capitalize, cn } from '@/lib/utils';
import { useSubscription } from '@/providers/subscription';
import { useState } from 'react';

type ModelSelectorProps = {
  options: string[];
  value: string;
  width?: number | string;
  className?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export const VoiceSelector = ({
  value,
  options,
  width = 250,
  className,
  onChange,
  disabled,
}: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { plan } = useSubscription();
  const activeVoice = options.find((voice) => voice === value);

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onChange}
      data={options.map((voice) => ({
        label: voice,
        value: capitalize(voice),
      }))}
      type="model"
    >
      <ComboboxTrigger
        className={className}
        style={{ width }}
        disabled={disabled}
      >
        {activeVoice && (
          <div className="flex w-full items-center gap-2 overflow-hidden">
            <span className="block truncate capitalize">{activeVoice}</span>
          </div>
        )}
      </ComboboxTrigger>
      <ComboboxContent
        popoverOptions={{
          sideOffset: 8,
        }}
      >
        <ComboboxInput />
        <ComboboxList>
          <ComboboxEmpty />
          <ComboboxGroup>
            {options.map((voice) => (
              <ComboboxItem
                key={voice}
                value={voice}
                onSelect={() => {
                  onChange?.(voice);
                  setOpen(false);
                }}
                className={cn(
                  value === voice &&
                    'bg-primary text-primary-foreground data-[selected=true]:bg-primary/80 data-[selected=true]:text-primary-foreground'
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="block truncate capitalize">{voice}</span>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
