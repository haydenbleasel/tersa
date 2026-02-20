const ALLOWED_BLOB_HOST = "public.blob.vercel-storage.com";

export function assertBlobUrl(input: string): URL {
  const url = new URL(input);

  if (url.protocol !== "https:") {
    throw new Error("Invalid image URL");
  }

  if (
    url.hostname !== ALLOWED_BLOB_HOST &&
    !url.hostname.endsWith(`.${ALLOWED_BLOB_HOST}`)
  ) {
    throw new Error("Invalid image URL");
  }

  return url;
}
