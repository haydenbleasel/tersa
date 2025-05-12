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
import type { PriceBracket } from '@/lib/models';
import { cn } from '@/lib/utils';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
} from 'lucide-react';
import { type ComponentType, type SVGProps, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type ModelSelectorProps = {
  id?: string;
  value: string;
  width?: number | string;
  className?: string;
  onChange?: (value: string) => void;
  options: {
    label: string;
    models: {
      icon?: ComponentType<SVGProps<SVGSVGElement>>;
      id: string;
      label: string;
      disabled?: boolean;
      priceIndicator?: PriceBracket;
    }[];
  }[];
};

const getCostBracketIcon = (bracket: PriceBracket, className?: string) => {
  switch (bracket) {
    case 'lowest':
      return (
        <ChevronsDownIcon
          size={16}
          className={cn('text-green-500 dark:text-green-400', className)}
        />
      );
    case 'low':
      return (
        <ChevronDownIcon
          size={16}
          className={cn('text-blue-500 dark:text-blue-400', className)}
        />
      );
    case 'high':
      return (
        <ChevronUpIcon
          size={16}
          className={cn('text-orange-500 dark:text-orange-400', className)}
        />
      );
    case 'highest':
      return (
        <ChevronsUpIcon
          size={16}
          className={cn('text-red-500 dark:text-red-400', className)}
        />
      );
    default:
      return null;
  }
};

const getCostBracketLabel = (bracket: PriceBracket) => {
  switch (bracket) {
    case 'lowest':
      return 'This model uses a lot less credits.';
    case 'low':
      return 'This model uses less credits.';
    case 'high':
      return 'This model uses more credits.';
    case 'highest':
      return 'This model uses a lot of credits.';
    default:
      return '';
  }
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
  const activeModel = options
    .flatMap((option) => option.models)
    .find((model) => model.id === value);

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
      <ComboboxTrigger className={className} id={id} style={{ width }}>
        {activeModel && (
          <div className="flex w-full items-center gap-2 overflow-hidden">
            {activeModel.icon && (
              <activeModel.icon className="size-4 shrink-0" />
            )}
            <span className="block truncate">{activeModel.label}</span>
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
          {options
            .filter((option) => option.models.length)
            .map((option) => (
              <ComboboxGroup key={option.label} heading={option.label}>
                {option.models.map((model) => (
                  <ComboboxItem
                    key={model.id}
                    value={model.id}
                    onSelect={() => {
                      onChange?.(model.id);
                      setOpen(false);
                    }}
                    disabled={model.disabled}
                    className={cn(
                      value === model.id &&
                        'bg-primary text-primary-foreground data-[selected=true]:bg-primary/80 data-[selected=true]:text-primary-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {model.icon && <model.icon className="size-4 shrink-0" />}
                      <span className="block truncate">{model.label}</span>
                    </div>
                    {model.priceIndicator && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-auto">
                            {getCostBracketIcon(
                              model.priceIndicator,
                              value === model.id
                                ? 'text-primary-foreground'
                                : ''
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{getCostBracketLabel(model.priceIndicator)}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
