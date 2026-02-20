import type { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import { gateway } from "@ai-sdk/gateway";
import type { ReactNode } from "react";
import { GatewayProviderClient } from "./client";

interface GatewayProviderProps {
  children: ReactNode;
}

// TODO: Remove once video models are available via gateway.getAvailableModels()
const temporaryVideoModels: GatewayLanguageModelEntry[] = [
  { id: "xai/grok-imagine-video", name: "Grok Imagine Video" },
  { id: "alibaba/wan-v2.6-t2v", name: "Wan v2.6 T2V" },
  { id: "alibaba/wan-v2.6-i2v", name: "Wan v2.6 I2V" },
  { id: "alibaba/wan-v2.6-i2v-flash", name: "Wan v2.6 I2V Flash" },
  { id: "alibaba/wan-v2.6-r2v", name: "Wan v2.6 R2V" },
  { id: "alibaba/wan-v2.6-r2v-flash", name: "Wan v2.6 R2V Flash" },
  { id: "alibaba/wan-v2.5-t2v-preview", name: "Wan v2.5 T2V Preview" },
  { id: "klingai/kling-v3.0-t2v", name: "Kling v3.0 T2V" },
  { id: "klingai/kling-v3.0-i2v", name: "Kling v3.0 I2V" },
  { id: "klingai/kling-v2.6-t2v", name: "Kling v2.6 T2V" },
  { id: "klingai/kling-v2.6-i2v", name: "Kling v2.6 I2V" },
  { id: "klingai/kling-v2.5-turbo-t2v", name: "Kling v2.5 Turbo T2V" },
  { id: "klingai/kling-v2.5-turbo-i2v", name: "Kling v2.5 Turbo I2V" },
  { id: "google/veo-3.1-generate-001", name: "Veo 3.1" },
  { id: "google/veo-3.1-fast-generate-001", name: "Veo 3.1 Fast" },
  { id: "google/veo-3.0-generate-001", name: "Veo 3.0" },
  { id: "google/veo-3.0-fast-generate-001", name: "Veo 3.0 Fast" },
].map((model) => ({
  ...model,
  specification: {
    specificationVersion: "v3" as const,
    provider: model.id.split("/")[0],
    modelId: model.id,
  },
}));

export const GatewayProvider = async ({ children }: GatewayProviderProps) => {
  const { models } = await gateway.getAvailableModels();
  const textModels = models.filter((model) => model.modelType === "language");
  const imageModels = models.filter((model) => model.modelType === "image");
  // const videoModels = models.filter((model) => model.modelType === "video");

  return (
    <GatewayProviderClient
      imageModels={imageModels}
      models={textModels}
      videoModels={temporaryVideoModels}
    >
      {children}
    </GatewayProviderClient>
  );
};
