'use server';

import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { getSubscribedUser } from '@/lib/protect';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import OpenAI, { toFile } from 'openai';

type EditImageActionProps = {
  images: {
    url: string;
    type: string;
  }[];
  instructions?: string;
  nodeId: string;
  projectId: string;
};

export const editImageAction = async ({
  images,
  instructions,
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
    const openai = new OpenAI();

    const promptImages = await Promise.all(
      images.map(async (image) => {
        const response = await fetch(image.url);
        const blob = await response.blob();

        return toFile(blob, nanoid(), {
          type: image.type,
        });
      })
    );

    const defaultPrompt =
      images.length > 1
        ? 'Create a variant of the image.'
        : 'Create a single variant of the images.';

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: promptImages,
      prompt: instructions ?? defaultPrompt,
      user: user.id,
    });

    const json = response.data?.at(0)?.b64_json;

    if (!json) {
      throw new Error('No url found');
    }

    const bytes = Buffer.from(json, 'base64');
    const contentType = 'image/png';

    const blob = await client.storage
      .from('files')
      .upload(`${user.id}/${nanoid()}`, bytes, {
        contentType,
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: downloadUrl } = client.storage
      .from('files')
      .getPublicUrl(blob.data.path);

    const allProjects = await database
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    const project = allProjects.at(0);

    if (!project) {
      throw new Error('Project not found');
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
        type: contentType,
      },
      description: instructions ?? defaultPrompt,
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
