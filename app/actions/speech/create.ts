'use server';

import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { speechModels } from '@/lib/models';
import { trackCreditUsage } from '@/lib/polar';
import { getSubscribedUser } from '@/lib/protect';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type GenerateSpeechActionProps = {
  text: string;
  modelId: string;
  nodeId: string;
  projectId: string;
};

export const generateSpeechAction = async ({
  text,
  nodeId,
  modelId,
  projectId,
}: GenerateSpeechActionProps): Promise<
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

    const model = speechModels
      .flatMap((m) => m.models)
      .find((m) => m.id === modelId);

    if (!model) {
      throw new Error('Model not found');
    }

    const { audio } = await generateSpeech({
      model: model.model,
      text,
      outputFormat: 'mp3',
    });

    await trackCreditUsage({
      userId: user.id,
      action: 'generate_speech',
      cost: model.getCost(text.length),
    });

    const blob = await client.storage
      .from('files')
      .upload(`${user.id}/${nanoid()}`, new Blob([audio.uint8Array]), {
        contentType: audio.mimeType,
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
        url: downloadUrl,
        type: audio.mimeType,
      },
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
