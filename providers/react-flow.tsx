"use client";

import { ReactFlowProvider as ReactFlowProviderComponent } from "@xyflow/react";
import type { ReactNode } from "react";

type ReactFlowProviderProps = {
  children: ReactNode;
};

export const ReactFlowProvider = ({ children }: ReactFlowProviderProps) => (
  <ReactFlowProviderComponent>{children}</ReactFlowProviderComponent>
);
