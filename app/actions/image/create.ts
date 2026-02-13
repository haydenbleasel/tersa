"use server";

import { gateway } from "@ai-sdk/gateway";
import type { Edge, Node, Viewport } from "@xyflow/react";
import { generateImage, generateText } from "ai";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSubscribedUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { parseError } from "@/lib/error/parse";
import { trackCreditUsage } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { projects } from "@/schema";

type GenerateImageActionProps = {
  prompt: string;
  nodeId: string;
  projectId: string;
  modelId: string;
  instructions?: string;
};

export const generateImageAction = async ({
  prompt,
  modelId,
  instructions,
  nodeId,
  projectId,
}: GenerateImageActionProps): Promise<
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

    const result = await generateImage({
      model: gateway.imageModel(modelId),
      prompt: [
        "Generate an image based on the following instructions and context.",
        "---",
        "Instructions:",
        instructions ?? "None.",
        "---",
        "Context:",
        prompt,
      ].join("\n"),
    });

    await trackCreditUsage({
      action: "generate_image",
      cost: flatCost,
    });

    const { image } = result;

    let extension = image.mediaType.split("/").pop();

    if (extension === "jpeg") {
      extension = "jpg";
    }

    const name = `${nanoid()}.${extension}`;

    const file: File = new File([image.uint8Array], name, {
      type: image.mediaType,
    });

    const blob = await client.storage
      .from("files")
      .upload(`${user.id}/${name}`, file, {
        contentType: file.type,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from("files")
      .getPublicUrl(blob.data.path);

    const url =
      process.env.NODE_ENV === "production"
        ? downloadUrl.publicUrl
        : `data:${image.mediaType};base64,${Buffer.from(image.uint8Array).toString("base64")}`;

    const { text: description } = await generateText({
      model: gateway("openai/gpt-5-nano"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image." },
            {
              type: "image",
              image: url,
            },
          ],
        },
      ],
    });

    if (!description) {
      throw new Error("No description found");
    }

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
        type: image.mediaType,
      },
      description,
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
