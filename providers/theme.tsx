"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export const ThemeProvider = (
  props: ComponentProps<typeof NextThemesProvider>
) => <NextThemesProvider {...props} />;
