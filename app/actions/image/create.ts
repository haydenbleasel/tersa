"use server";

import type { Edge, Node, Viewport } from "@xyflow/react";
import {
  type Experimental_GenerateImageResult,
  experimental_generateImage as generateImage,
} from "ai";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import OpenAI from "openai";
import { getSubscribedUser } from "@/lib/auth";
import { database } from "@/lib/database";
import { parseError } from "@/lib/error/parse";
import { imageModels } from "@/lib/models/image";
import { visionModels } from "@/lib/models/vision";
import { trackCreditUsage } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { projects } from "@/schema";

type GenerateImageActionProps = {
  prompt: string;
  nodeId: string;
  projectId: string;
  modelId: string;
  instructions?: string;
  size?: string;
};

const generateGptImage1Image = async ({
  instructions,
  prompt,
  size,
}: {
  instructions?: string;
  prompt: string;
  size?: string;
}) => {
  const openai = new OpenAI();
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt: [
      "Generate an image based on the following instructions and context.",
      "---",
      "Instructions:",
      instructions ?? "None.",
      "---",
      "Context:",
      prompt,
    ].join("\n"),
    size: size as never | undefined,
    moderation: "low",
    quality: "high",
    output_format: "png",
  });

  const json = response.data?.at(0)?.b64_json;

  if (!json) {
    throw new Error("No response JSON found");
  }

  if (!response.usage) {
    throw new Error("No usage found");
  }

  const image: Experimental_GenerateImageResult["image"] = {
    base64: json,
    uint8Array: Buffer.from(json, "base64"),
    mediaType: "image/png",
  };

  return {
    image,
    usage: {
      textInput: response.usage?.input_tokens_details.text_tokens,
      imageInput: response.usage?.input_tokens_details.image_tokens,
      output: response.usage?.output_tokens,
    },
  };
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export const generateImageAction = async ({
  prompt,
  modelId,
  instructions,
  nodeId,
  projectId,
  size,
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
    const model = imageModels[modelId];

    if (!model) {
      throw new Error("Model not found");
    }

    let image: Experimental_GenerateImageResult["image"] | undefined;

    const provider = model.providers[0];

    if (provider.model.modelId === "gpt-image-1") {
      const generatedImageResponse = await generateGptImage1Image({
        instructions,
        prompt,
        size,
      });

      await trackCreditUsage({
        action: "generate_image",
        cost: provider.getCost({
          ...generatedImageResponse.usage,
          size,
        }),
      });

      image = generatedImageResponse.image;
    } else {
      let aspectRatio: `${number}:${number}` | undefined;
      if (size) {
        const [width, height] = size.split("x").map(Number);
        const divisor = gcd(width, height);
        aspectRatio = `${width / divisor}:${height / divisor}`;
      }

      const generatedImageResponse = await generateImage({
        model: provider.model,
        prompt: [
          "Generate an image based on the following instructions and context.",
          "---",
          "Instructions:",
          instructions ?? "None.",
          "---",
          "Context:",
          prompt,
        ].join("\n"),
        size: size as never,
        aspectRatio,
      });

      await trackCreditUsage({
        action: "generate_image",
        cost: provider.getCost({
          size,
        }),
      });

      image = generatedImageResponse.image;
    }

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

    const project = await database.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const visionModel = visionModels[project.visionModel];

    if (!visionModel) {
      throw new Error("Vision model not found");
    }

    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
      model: visionModel.providers[0].model.modelId,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image." },
            {
              type: "image_url",
              image_url: {
                url,
              },
            },
          ],
        },
      ],
    });

    const description = response.choices.at(0)?.message.content;

    if (!description) {
      throw new Error("No description found");
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

    const updatedNodes = content.nodes.map((existingNode) => {
      if (existingNode.id === nodeId) {
        return {
          ...existingNode,
          data: newData,
        };
      }

      return existingNode;
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
