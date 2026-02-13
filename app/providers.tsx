"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
);
