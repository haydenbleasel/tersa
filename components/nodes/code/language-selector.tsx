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
import { useState } from 'react';
import { languages } from './languages';

type LanguageSelectorProps = {
  id?: string;
  value: string;
  width?: number | string;
  className?: string;
  onChange?: (value: string) => void;
};

export const LanguageSelector = ({
  id,
  value,
  width = 200,
  className,
  onChange,
}: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      data={languages.map((language) => ({
        label: language.label,
        value: language.id,
      }))}
      type="language"
      value={value}
      onValueChange={onChange}
    >
      <ComboboxTrigger id={id} className="rounded-full" style={{ width }} />
      <ComboboxContent className={cn('p-0', className)}>
        <ComboboxInput />
        <ComboboxList>
          <ComboboxEmpty />
          <ComboboxGroup>
            {languages.map((language) => (
              <ComboboxItem
                key={language.id}
                value={language.id}
                onSelect={() => {
                  onChange?.(language.id);
                  setOpen(false);
                }}
              >
                {language.label}
                <CheckIcon
                  className={cn(
                    'ml-auto size-4',
                    value === language.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
