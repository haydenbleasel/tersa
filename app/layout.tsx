import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mono, sans, serif } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "@/providers/posthog-provider";
import { ThemeProvider } from "@/providers/theme";

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={cn(
        sans.variable,
        serif.variable,
        mono.variable,
        "bg-background text-foreground antialiased"
      )}
    >
      <PostHogProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster className="z-[99999999]" />
        </ThemeProvider>
        <Analytics />
      </PostHogProvider>
    </body>
  </html>
);

export default RootLayout;
