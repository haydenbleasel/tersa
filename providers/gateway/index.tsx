import { gateway } from "@ai-sdk/gateway";
import type { ReactNode } from "react";
import { GatewayProviderClient } from "./client";

type GatewayProviderProps = {
  children: ReactNode;
};

export const GatewayProvider = async ({ children }: GatewayProviderProps) => {
  const { models } = await gateway.getAvailableModels();
  const textModels = models.filter((model) => model.modelType === "language");
  const imageModels = models.filter((model) => model.modelType === "image");

  return (
    <GatewayProviderClient imageModels={imageModels} models={textModels}>
      {children}
    </GatewayProviderClient>
  );
};
