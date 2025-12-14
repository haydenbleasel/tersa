import { useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/kibo-ui/combobox";
import { capitalize, cn } from "@/lib/utils";

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
  const activeVoice = options.find((voice) => voice === value);

  return (
    <Combobox
      data={options.map((voice) => ({
        label: voice,
        value: capitalize(voice),
      }))}
      onOpenChange={setOpen}
      onValueChange={onChange}
      open={open}
      type="model"
      value={value}
    >
      <ComboboxTrigger
        className={className}
        disabled={disabled}
        style={{ width }}
      >
        {activeVoice ? (
          <div className="flex w-full items-center gap-2 overflow-hidden">
            <span className="block truncate capitalize">{activeVoice}</span>
          </div>
        ) : null}
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
                className={cn(
                  value === voice &&
                    "bg-primary text-primary-foreground data-[selected=true]:bg-primary/80 data-[selected=true]:text-primary-foreground"
                )}
                key={voice}
                onSelect={() => {
                  onChange?.(voice);
                  setOpen(false);
                }}
                value={voice}
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
