import { LumaAI } from "lumaai";
import { env } from "@/lib/env";
import type { VideoModel } from "@/lib/models/video";

export const luma = (
  modelId: "ray-1-6" | "ray-2" | "ray-flash-2"
): VideoModel => ({
  modelId,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex video generation with polling
  generate: async ({ prompt, imagePrompt, duration }) => {
    const lumaClient = new LumaAI({ authToken: env.LUMA_API_KEY });

    if (process.env.NODE_ENV !== "production" && imagePrompt) {
      throw new Error("Luma does not support base64 image input.");
    }

    const response = await lumaClient.generations.video.create({
      prompt,
      model: modelId,
      duration: `${duration}s`,
      keyframes: imagePrompt
        ? {
            frame0: {
              type: "image",
              url: imagePrompt,
            },
          }
        : undefined,
      resolution: modelId === "ray-1-6" ? "720p" : "1080p",
    });

    const jobId = response.id;

    if (!jobId) {
      throw new Error("Luma didn't return a job ID");
    }

    const startTime = Date.now();
    const maxPollTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    while (Date.now() - startTime < maxPollTime) {
      const generation = await lumaClient.generations.get(jobId);

      if (generation.state === "failed") {
        throw new Error(
          `Luma video generation failed: ${generation.failure_reason ?? "unknown reason"}`
        );
      }

      if (generation.state === "completed") {
        if (!generation.assets?.video) {
          throw new Error("Luma video generation didn't return a video asset");
        }

        return generation.assets.video;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Luma video generation timed out");
  },
});
