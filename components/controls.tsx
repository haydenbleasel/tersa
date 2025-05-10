'use client';

import { Controls as FlowControls } from '@xyflow/react';
import { memo } from 'react';
import { ThemeSwitcher } from './theme-switcher';

export const ControlsInner = () => (
  <FlowControls
    orientation="horizontal"
    className="flex-col! rounded-full border bg-card/90 p-1 shadow-none! drop-shadow-xs backdrop-blur-sm sm:flex-row!"
    showInteractive={false}
  >
    <ThemeSwitcher />
  </FlowControls>
);

export const Controls = memo(ControlsInner);
