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
  const currentOption = languages.find((language) => language.id === value);

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
          {currentOption?.label ?? 'Select language...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width }}>
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
