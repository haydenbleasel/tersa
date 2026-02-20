"use client";

import { memo } from "react";
import { Controls as ControlsPrimitive } from "./ai-elements/controls";
import { ThemeSwitcher } from "./theme-switcher";

export const ControlsInner = () => (
  // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Prevents ReactFlow double-click zoom
  <div onDoubleClick={(e) => e.stopPropagation()} role="toolbar">
    <ControlsPrimitive
      className="rounded-full [&>button]:rounded-full [&>button]:hover:bg-accent"
      orientation="horizontal"
      showInteractive={false}
    >
      <ThemeSwitcher />
    </ControlsPrimitive>
  </div>
);

export const Controls = memo(ControlsInner);
