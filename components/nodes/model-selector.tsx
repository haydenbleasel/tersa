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
import type { chatModels } from '@/lib/models';
import { cn } from '@/lib/utils';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
  MinusIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type CostBracket = 'lowest' | 'low' | 'medium' | 'high' | 'highest';

const getCostBracketIcon = (bracket: CostBracket, className?: string) => {
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
    case 'medium':
      return <MinusIcon size={16} className={cn('text-border', className)} />;
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

type ModelSelectorProps = {
  id?: string;
  value: string;
  width?: number | string;
  className?: string;
  onChange?: (value: string) => void;
  options: {
    label: string;
    models: (typeof chatModels)[number]['models'];
  }[];
};

export const ModelSelector = ({
  id,
  value,
  options,
  width = 250,
  className,
  onChange,
}: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const activeModel = options
    .flatMap((option) => option.models)
    .find((model) => model.id === value);

  // Calculate costs and brackets for all models
  const { getCostBracket } = useMemo(() => {
    const allModels = options.flatMap((option) => option.models);
    const costs = allModels
      .filter(
        (
          model
        ): model is typeof model & {
          getCost: NonNullable<(typeof model)['getCost']>;
        } => model.getCost !== undefined
      )
      .map((model) => model.getCost({ input: 1000, output: 1000 }));

    if (costs.length === 0) {
      return {
        getCostBracket: () => 'medium' as CostBracket,
      };
    }

    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const range = maxCost - minCost;

    // Define brackets based on percentiles of the cost range
    const getCostBracket = (cost: number): CostBracket => {
      const percentile = (cost - minCost) / range;
      if (percentile <= 0.2) {
        return 'lowest';
      }
      if (percentile <= 0.4) {
        return 'low';
      }
      if (percentile <= 0.6) {
        return 'medium';
      }
      if (percentile <= 0.8) {
        return 'high';
      }

      return 'highest';
    };

    return { getCostBracket };
  }, [options]);

  // Memoize helper functions
  const memoizedHelpers = useMemo(
    () => ({
      getModelCostBracket: (model: typeof activeModel) => {
        if (!model?.getCost) {
          return null;
        }
        const cost = model.getCost({ input: 1000, output: 1000 });
        return getCostBracket(cost);
      },
      getRelativeCost: (bracket: CostBracket) => {
        switch (bracket) {
          case 'lowest':
            return 'a lot less credits';
          case 'low':
            return 'a bit less credits';
          case 'high':
            return 'a bit more credits';
          case 'highest':
            return 'much more credits';
          default:
            return '';
        }
      },
    }),
    [getCostBracket]
  );

  // Memoize the model groups rendering
  const modelGroups = useMemo(() => {
    return options
      .filter((option) => option.models.length)
      .map((option) => {
        const models = option.models.map((model) => {
          const costBracket =
            memoizedHelpers.getModelCostBracket(model) ?? 'medium';
          const costIcon = getCostBracketIcon(
            costBracket,
            value === model.id ? 'text-primary-foreground' : undefined
          );
          const relativeCost = memoizedHelpers.getRelativeCost(costBracket);
          const isSelected = value === model.id;

          return {
            model,
            costBracket,
            costIcon,
            relativeCost,
            isSelected,
          };
        });

        return {
          label: option.label,
          models,
        };
      });
  }, [options, value, memoizedHelpers]);

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
            {memoizedHelpers.getModelCostBracket(activeModel) !== 'medium' ||
              (!activeModel.getCost && (
                <span className="ml-auto rounded-full p-0.5 font-medium text-xs">
                  {getCostBracketIcon(
                    memoizedHelpers.getModelCostBracket(activeModel) ??
                      'medium',
                    className
                  )}
                </span>
              ))}
          </div>
        )}
      </ComboboxTrigger>
      <ComboboxContent
        popoverOptions={{
          sideOffset: 8,
        }}
        className={cn('shadow-2xl shadow-black/10', className)}
      >
        <ComboboxInput />
        <ComboboxList>
          <ComboboxEmpty />
          {modelGroups.map((group) => (
            <ComboboxGroup key={group.label} heading={group.label}>
              {group.models.map(
                ({
                  model,
                  costIcon,
                  relativeCost,
                  isSelected,
                  costBracket,
                }) => (
                  <ComboboxItem
                    key={model.id}
                    value={model.id}
                    onSelect={() => {
                      onChange?.(model.id);
                      setOpen(false);
                    }}
                    disabled={model.disabled}
                    className={cn(
                      isSelected &&
                        'bg-primary text-primary-foreground data-[selected=true]:bg-primary/80 data-[selected=true]:text-primary-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {model.icon && (
                        <model.icon
                          className={cn(
                            'size-4 shrink-0',
                            isSelected && 'text-primary-foreground'
                          )}
                        />
                      )}
                      <span className="block truncate">{model.label}</span>
                    </div>
                    {costBracket !== 'medium' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              'ml-auto rounded-full p-0.5 font-medium text-xs',
                              isSelected && 'text-primary-foreground'
                            )}
                          >
                            {costIcon}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>This model will use {relativeCost}.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </ComboboxItem>
                )
              )}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
