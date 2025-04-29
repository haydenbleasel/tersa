'use server';

import { env } from '@/lib/env';
import { videoModels } from '@/lib/models';
import { getSubscribedUser } from '@/lib/protect';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

type CreateJobProps = {
  model:
    | 'T2V-01-Director'
    | 'I2V-01-Director'
    | 'S2V-01'
    | 'I2V-01'
    | 'I2V-01-live'
    | 'T2V-01';
  prompt: string;
  prompt_optimizer?: boolean;
  first_frame_image?: string;
  subject_reference?: string[];
  callback_url?: string;
};

type CreateJobResponse = {
  task_id: string;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
};

type QueryJobResponse = {
  task_id: string;
  status: 'Queueing' | 'Preparing' | 'Processing' | 'Success' | 'Fail';
  file_id?: string;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
};

type RetrieveUrlResponse = {
  file: {
    file_id: number;
    bytes: number;
    created_at: number;
    filename: string;
    purpose: string;
    download_url: string;
    backup_download_url: string;
  };
  base_resp: {
    status_code: number;
    status_msg: string;
  };
};

const baseUrl = 'https://api.minimaxi.chat/';

export const generateVideoAction = async (
  modelId: string,
  prompt: string,
  images: {
    url: string;
    type: string;
  }[]
): Promise<
  | {
      url: string;
      type: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const client = await createClient();
    const user = await getSubscribedUser();

    const model = videoModels
      .flatMap((model) => model.models)
      .find((model) => model.id === modelId);

    if (!model) {
      throw new Error('Model not found');
    }

    const props: CreateJobProps = {
      model: model.id as CreateJobProps['model'],
      prompt,
      first_frame_image:
        'https://zszbbhofscgnnkvyonow.supabase.co/storage/v1/object/public/files/97131ce3-3415-4ea5-893c-7c30d201dec1/-lhMcumQRWpbaqJRVe7sr.jpg',
    };

    // Create job
    const createJobResponse = await fetch(
      new URL('/v1/video_generation', baseUrl),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
        },
        body: JSON.stringify(props),
      }
    );

    const createJobData = (await createJobResponse.json()) as CreateJobResponse;

    if (createJobData.base_resp.status_code !== 0) {
      throw new Error(`API error: ${createJobData.base_resp.status_msg}`);
    }

    const taskId = createJobData.task_id;
    // Poll for job completion (max 2 minutes)
    let isCompleted = false;
    let fileId: string | null = null;
    const startTime = Date.now();
    const maxPollTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    while (!isCompleted && Date.now() - startTime < maxPollTime) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const queryJobResponse = await fetch(
        new URL(`/v1/query/video_generation?task_id=${taskId}`, baseUrl),
        {
          headers: {
            authorization: `Bearer ${env.MINIMAX_API_KEY}`,
          },
        }
      );

      const queryJobData = (await queryJobResponse.json()) as QueryJobResponse;

      if (queryJobData.base_resp.status_code !== 0) {
        throw new Error(`API error: ${queryJobData.base_resp.status_msg}`);
      }

      if (queryJobData.status === 'Success') {
        isCompleted = true;
        fileId = queryJobData.file_id as string;
      } else if (queryJobData.status === 'Fail') {
        throw new Error('Video generation failed');
      }
    }

    if (!isCompleted) {
      throw new Error('Video generation timed out after 2 minutes');
    }

    if (!fileId) {
      throw new Error('Failed to get file_id');
    }

    // Retrieve download URL
    const retrieveUrlResponse = await fetch(
      new URL(
        `/v1/files/retrieve?GroupId=${env.MINIMAX_GROUP_ID}&file_id=${fileId}`,
        baseUrl
      ),
      {
        headers: {
          authority: 'api.minimaxi.chat',
          authorization: `Bearer ${env.MINIMAX_API_KEY}`,
        },
      }
    );

    const retrieveUrlData =
      (await retrieveUrlResponse.json()) as RetrieveUrlResponse;

    if (retrieveUrlData.base_resp.status_code !== 0) {
      throw new Error(`API error: ${retrieveUrlData.base_resp.status_msg}`);
    }

    // Download the video
    const videoResponse = await fetch(retrieveUrlData.file.download_url);
    const videoArrayBuffer = await videoResponse.arrayBuffer();

    const blob = await client.storage
      .from('files')
      .upload(`${user.id}/${nanoid()}.mp4`, videoArrayBuffer, {
        contentType: 'video/mp4',
      });

    if (blob.error) {
      throw new Error(blob.error.message);
    }

    const { data: supabaseDownloadUrl } = client.storage
      .from('files')
      .getPublicUrl(blob.data.path);

    return { url: supabaseDownloadUrl.publicUrl, type: 'video/mp4' };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return { error: errorMessage };
  }
};
