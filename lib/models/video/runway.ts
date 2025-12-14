import RunwayML from "@runwayml/sdk";
import { env } from "@/lib/env";
import type { VideoModel } from "@/lib/models/video";

export const runway = (modelId: "gen4_turbo" | "gen3a_turbo"): VideoModel => ({
  modelId,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex video generation with polling
  generate: async ({ prompt, imagePrompt, duration }) => {
    if (!imagePrompt) {
      throw new Error("Runway requires at least one image");
    }

    const client = new RunwayML({ apiKey: env.RUNWAYML_API_SECRET });

    const response =
      modelId === "gen4_turbo"
        ? await client.imageToVideo.create({
            model: "gen4_turbo",
            promptImage: imagePrompt,
            ratio: "1280:720",
            promptText: prompt,
            duration,
          })
        : await client.imageToVideo.create({
            model: "gen3a_turbo",
            promptImage: imagePrompt,
            ratio: "1280:768",
            promptText: prompt,
            duration,
          });

    const startTime = Date.now();
    const maxPollTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    while (Date.now() - startTime < maxPollTime) {
      const task = await client.tasks.retrieve(response.id);

      if (task.status === "CANCELLED" || task.status === "FAILED") {
        throw new Error("Runway video generation failed.");
      }

      if (task.status === "SUCCEEDED") {
        if (!task.output?.length) {
          throw new Error("Runway video didn't generate output.");
        }

        const url = task.output.at(0);

        if (!url) {
          throw new Error("Runway video generation failed: No output URL");
        }

        return url;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Runway video generation timed out");
  },
});
