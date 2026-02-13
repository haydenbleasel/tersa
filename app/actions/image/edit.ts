"use server";

import { gateway } from "@ai-sdk/gateway";
import type { Edge, Node, Viewport } from "@xyflow/react";
import { generateImage } from "ai";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSubscribedUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { parseError } from "@/lib/error/parse";
import { trackCreditUsage } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { projects } from "@/schema";

type EditImageActionProps = {
  images: {
    url: string;
    type: string;
  }[];
  modelId: string;
  instructions?: string;
  nodeId: string;
  projectId: string;
};

export const editImageAction = async ({
  images,
  instructions,
  modelId,
  nodeId,
  projectId,
}: EditImageActionProps): Promise<
  | {
      nodeData: object;
    }
  | {
      error: string;
    }
> => {
  try {
    const client = await createClient();
    const user = await getSubscribedUser();

    const { models } = await gateway.getAvailableModels();
    const gatewayModel = models.find((m) => m.id === modelId);

    if (!gatewayModel) {
      throw new Error("Model not found");
    }

    const inputPrice = gatewayModel.pricing?.input
      ? Number.parseFloat(gatewayModel.pricing.input)
      : 0;
    const outputPrice = gatewayModel.pricing?.output
      ? Number.parseFloat(gatewayModel.pricing.output)
      : 0;
    const flatCost = inputPrice + outputPrice || 0.04;

    const defaultPrompt =
      images.length > 1
        ? "Create a variant of the image."
        : "Create a single variant of the images.";

    const prompt =
      !instructions || instructions === "" ? defaultPrompt : instructions;

    const imageData = await Promise.all(
      images.map(async (img) => {
        const response = await fetch(img.url);
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      })
    );

    const result = await generateImage({
      model: gateway.imageModel(modelId),
      prompt: {
        images: imageData,
        text: prompt,
      },
    });

    await trackCreditUsage({
      action: "generate_image",
      cost: flatCost,
    });

    const { image } = result;

    const bytes = Buffer.from(image.base64, "base64");
    const contentType = "image/png";

    const blob = await client.storage
      .from("files")
      .upload(`${user.id}/${nanoid()}`, bytes, {
        contentType,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from("files")
      .getPublicUrl(blob.data.path);

    const project = await database.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const content = project.content as {
      nodes: Node[];
      edges: Edge[];
      viewport: Viewport;
    };

    const existingNode = content.nodes.find((n) => n.id === nodeId);

    if (!existingNode) {
      throw new Error("Node not found");
    }

    const newData = {
      ...(existingNode.data ?? {}),
      updatedAt: new Date().toISOString(),
      generated: {
        url: downloadUrl.publicUrl,
        type: contentType,
      },
      description: instructions ?? defaultPrompt,
    };

    const updatedNodes = content.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: newData,
        };
      }

      return node;
    });

    await database
      .update(projects)
      .set({ content: { ...content, nodes: updatedNodes } })
      .where(eq(projects.id, projectId));

    return {
      nodeData: newData,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
