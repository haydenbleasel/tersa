import { nanoid } from 'nanoid';
import { createClient } from './supabase/client';

export const uploadFile = async (file: File, bucket: 'avatars' | 'files') => {
  const client = createClient();
  const { data } = await client.auth.getUser();
  const extension = file.name.split('.').pop();

  if (!data?.user) {
    throw new Error('You need to be logged in to upload a file!');
  }

  const blob = await client.storage
    .from(bucket)
    .upload(`${data.user.id}/${nanoid()}.${extension}`, file, {
      contentType: file.type,
    });

  if (blob.error) {
    throw new Error(blob.error.message);
  }

  const { data: downloadUrl } = client.storage
    .from(bucket)
    .getPublicUrl(blob.data.path);

  return {
    url: downloadUrl.publicUrl,
    type: file.type,
  };
};
