'use server';

import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { imageModels, visionModels } from '@/lib/models';
import { trackCreditUsage } from '@/lib/polar';
import { getSubscribedUser } from '@/lib/protect';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { experimental_generateImage as generateImage } from 'ai';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import OpenAI from 'openai';

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
    const model = imageModels
      .flatMap((m) => m.models)
      .find((m) => m.id === modelId);

    if (!model) {
      throw new Error('Model not found');
    }

    const { image } = await generateImage({
      model: model.model,
      prompt: [
        'Generate an image based on the following instructions and context.',
        '---',
        'Instructions:',
        instructions ?? 'None.',
        '---',
        'Context:',
        prompt,
      ].join('\n'),
    });

    await trackCreditUsage({
      userId: user.id,
      action: 'generate_image',
      cost: model.getCost(),
    });

    const blob = await client.storage
      .from('files')
      .upload(`${user.id}/${nanoid()}`, new Blob([image.uint8Array]), {
        contentType: image.mimeType,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from('files')
      .getPublicUrl(blob.data.path);

    const openai = new OpenAI();

    const url =
      process.env.NODE_ENV === 'production'
        ? downloadUrl.publicUrl
        : `data:${image.mimeType};base64,${Buffer.from(image.uint8Array).toString('base64')}`;

    const allProjects = await database
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    const project = allProjects.at(0);

    if (!project) {
      throw new Error('Project not found');
    }

    const visionModel = visionModels
      .flatMap((model) => model.models)
      .find((model) => model.id === project.visionModel);

    if (!visionModel) {
      throw new Error('Vision model not found');
    }

    const response = await openai.chat.completions.create({
      model: visionModel.id,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image.' },
            {
              type: 'image_url',
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
      throw new Error('No description found');
    }

    const content = project.content as {
      nodes: {
        id: string;
        type: string;
        data: object;
      }[];
    };

    const existingNode = content.nodes.find((n) => n.id === nodeId);

    if (!existingNode) {
      throw new Error('Node not found');
    }

    const newData = {
      ...(existingNode.data ?? {}),
      updatedAt: new Date().toISOString(),
      generated: {
        url: downloadUrl.publicUrl,
        type: image.mimeType,
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
      .set({ content: { nodes: updatedNodes } })
      .where(eq(projects.id, projectId));

    return {
      nodeData: newData,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
