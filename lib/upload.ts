import { upload } from "@vercel/blob/client";
import { nanoid } from "nanoid";

export const uploadFile = async (file: File) => {
  const extension = file.name.split(".").pop();
  const name = `${nanoid()}.${extension}`;

  const blob = await upload(name, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });

  return {
    url: blob.url,
    type: file.type,
  };
};
