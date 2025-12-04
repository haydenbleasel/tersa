import {
  CheckIcon,
  RectangleHorizontalIcon,
  RectangleVerticalIcon,
  SquareIcon,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

type ImageSizeSelectorProps = {
  id?: string;
  value: string;
  options: string[];
  width?: number | string;
  className?: string;
  onChange?: (value: string) => void;
};

const getIcon = (option: string) => {
  const [width, height] = option.split("x").map(Number);

  if (width === height) {
    return <SquareIcon className="text-muted-foreground" size={16} />;
  }

  if (width > height) {
    return (
      <RectangleHorizontalIcon className="text-muted-foreground" size={16} />
    );
  }

  return <RectangleVerticalIcon className="text-muted-foreground" size={16} />;
};

const getLabel = (option: string) => {
  const [width, height] = option.split("x").map(Number);

  return (
    <div className="flex items-center gap-1 truncate">
      <span>{width}</span>
      <span className="text-muted-foreground">&times;</span>
      <span>{height}</span>
    </div>
  );
};

export const ImageSizeSelector = ({
  id,
  value,
  width = 200,
  options,
  className,
  onChange,
}: ImageSizeSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      data={options.map((option) => ({
        label: option,
        value: option,
      }))}
      onOpenChange={setOpen}
      onValueChange={onChange}
      open={open}
      type="size"
      value={value}
    >
      <ComboboxTrigger className="rounded-full" id={id} style={{ width }}>
        <div className="flex w-full items-center gap-2">
          {getIcon(value)}
          {getLabel(value)}
        </div>
      </ComboboxTrigger>
      <ComboboxContent className={cn("p-0", className)}>
        <ComboboxInput />
        <ComboboxList>
          <ComboboxEmpty />
          <ComboboxGroup>
            {options.map((option) => (
              <ComboboxItem
                key={option}
                onSelect={() => {
                  onChange?.(option);
                  setOpen(false);
                }}
                value={option}
              >
                {getIcon(option)}
                {getLabel(option)}
                <CheckIcon
                  className={cn(
                    "ml-auto size-4",
                    value === option ? "opacity-100" : "opacity-0"
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
