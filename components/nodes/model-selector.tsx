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
import type { PriceBracket } from '@/lib/models/text';
import type { TersaModel } from '@/lib/providers';
import { cn } from '@/lib/utils';
import {
  type SubscriptionContextType,
  useSubscription,
} from '@/providers/subscription';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type ModelSelectorProps = {
  id: string;
  options: Record<string, TersaModel>;
  value: string;
  width?: number | string;
  className?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
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

const getModelDisabled = (
  model: TersaModel,
  plan: SubscriptionContextType['plan']
) => {
  if (model.disabled) {
    return true;
  }

  if (
    (!plan || plan === 'hobby') &&
    (model.priceIndicator === 'highest' || model.priceIndicator === 'high')
  ) {
    return true;
  }

  return false;
};

export const ModelSelector = ({
  id,
  value,
  options,
  width = 250,
  className,
  onChange,
  disabled,
}: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { plan } = useSubscription();
  const activeModel = options[value];

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onChange}
      data={Object.entries(options).map(([id, model]) => ({
        label: model.label,
        value: id,
      }))}
      type="model"
    >
      <ComboboxTrigger
        className={className}
        id={id}
        style={{ width }}
        disabled={disabled}
      >
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
          {Object.entries(options)
            .filter(([_, model]) => model.providers.length)
            .map(([id, model]) => (
              <ComboboxGroup key={id} heading={model.label}>
                <ComboboxItem
                  key={id}
                  value={id}
                  onSelect={() => {
                    onChange?.(id);
                    setOpen(false);
                  }}
                  disabled={getModelDisabled(model, plan)}
                  className={cn(
                    value === id &&
                      'bg-primary text-primary-foreground data-[selected=true]:bg-primary/80 data-[selected=true]:text-primary-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {model.icon && (
                      <model.icon
                        className={cn(
                          'size-4 shrink-0',
                          value === id && 'text-primary-foreground'
                        )}
                      />
                    )}
                    <span className="block truncate">{model.label}</span>
                  </div>
                  {model.priceIndicator && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-auto">
                          {getCostBracketIcon(
                            model.priceIndicator,
                            value === id ? 'text-primary-foreground' : ''
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{getCostBracketLabel(model.priceIndicator)}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </ComboboxItem>
              </ComboboxGroup>
            ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
