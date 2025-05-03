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
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { type ComponentType, type SVGProps, useState } from 'react';

type ModelSelectorProps = {
  id?: string;
  value: string;
  width?: number | string;
  className?: string;
  onChange?: (value: string) => void;
  options: {
    label: string;
    models: {
      icon: ComponentType<SVGProps<SVGSVGElement>>;
      id: string;
      label: string;
    }[];
  }[];
};

export const ModelSelector = ({
  id,
  value,
  options,
  width = 200,
  className,
  onChange,
}: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onChange}
      data={options
        .flatMap((option) => option.models)
        .map((model) => ({
          label: model.label,
          value: model.id,
        }))}
      type="model"
    >
      <ComboboxTrigger className="rounded-full" id={id} style={{ width }} />
      <ComboboxContent className={cn('p-0', className)}>
        <ComboboxInput />
        <ComboboxList>
          <ComboboxEmpty />
          {options.map((option) => (
            <ComboboxGroup key={option.label} heading={option.label}>
              {option.models.map((model) => (
                <ComboboxItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => {
                    onChange?.(model.id);
                    setOpen(false);
                  }}
                  // Temporarily disable non-OpenAI / non-Minimax models
                  disabled={
                    option.label !== 'OpenAI' && option.label !== 'Minimax'
                  }
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <model.icon className="size-4 shrink-0" />
                    <span className="block truncate">{model.label}</span>
                  </div>
                  <CheckIcon
                    className={cn(
                      'ml-auto size-4',
                      value === model.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
