"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  {
    label: "Light",
    icon: SunIcon,
    value: "light",
  },
  {
    label: "Dark",
    icon: MoonIcon,
    value: "dark",
  },
  {
    label: "System",
    icon: MonitorIcon,
    value: "system",
  },
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Select theme"
            className="rounded-full"
            size="icon"
            variant="ghost"
          >
            {theme === "light" && <SunIcon size={16} />}
            {theme === "dark" && <MoonIcon size={16} />}
            {theme === "system" && <MonitorIcon size={16} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-32">
          {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
            >
              <themeOption.icon
                aria-hidden="true"
                className="opacity-60"
                size={16}
                strokeWidth={2}
              />
              <span>{themeOption.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
