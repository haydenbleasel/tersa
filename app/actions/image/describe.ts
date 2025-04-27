'use server';

import { database } from '@/lib/database';
import { visionModels } from '@/lib/models';
import { createClient } from '@/lib/supabase/server';
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
    const client = await createClient();
    const { data } = await client.auth.getUser();

    if (!data?.user) {
      throw new Error('Create an account to use AI features.');
    }

    if (data.user.user_metadata.isBanned) {
      throw new Error('You are banned from using AI features.');
    }

    if (!data.user.user_metadata.stripeSubscriptionId) {
      throw new Error('Please upgrade to a paid plan to use AI features.');
    }

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

    return {
      description,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
