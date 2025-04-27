import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
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
  const currentOption = options
    .flatMap((option) => option.models)
    .find((model) => model.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(className, 'justify-between')}
          style={{ width }}
          id={id}
        >
          {currentOption ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <currentOption.icon className="size-4 shrink-0" />
              <span className="block truncate">{currentOption.label}</span>
            </div>
          ) : (
            'Select model...'
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width }}>
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {options.map((option) => (
              <CommandGroup key={option.label} heading={option.label}>
                {option.models.map((model) => (
                  <CommandItem
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
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
