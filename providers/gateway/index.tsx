import type { ReactNode } from "react";
import { gateway } from "@/lib/gateway";
import { GatewayProviderClient } from "./client";

type GatewayProviderProps = {
  children: ReactNode;
};

export const GatewayProvider = async ({ children }: GatewayProviderProps) => {
  const { models } = await gateway.getAvailableModels();
  const textModels = models.filter((model) => model.modelType === "language");

  return (
    <GatewayProviderClient models={textModels}>
      {children}
    </GatewayProviderClient>
  );
};
