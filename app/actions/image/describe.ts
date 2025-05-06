'use server';

import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { visionModels } from '@/lib/models';
import { getSubscribedUser } from '@/lib/protect';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

export const describeAction = async (
  url: string,
  projectId: string
): Promise<
  | {
      description: string;
    }
  | {
      error: string;
    }
> => {
  try {
    await getSubscribedUser();

    const openai = new OpenAI();

    const project = await database
      .select({
        visionModel: projects.visionModel,
      })
      .from(projects)
      .where(eq(projects.id, projectId));

    const model = visionModels
      .flatMap((model) => model.models)
      .find((model) => model.id === project[0].visionModel);

    if (!model) {
      throw new Error('Model not found');
    }

    let parsedUrl = url;

    if (process.env.NODE_ENV !== 'production') {
      const response = await fetch(url);
      const blob = await response.blob();

      parsedUrl = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;
    }

    const response = await openai.chat.completions.create({
      model: model.id,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image.' },
            {
              type: 'image_url',
              image_url: {
                url: parsedUrl,
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

    return {
      description,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
