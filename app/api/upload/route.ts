import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/*",
          "audio/*",
          "video/*",
          "application/pdf",
          "text/*",
        ],
        maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
      }),
      // Required by @vercel/blob but no action needed
      onUploadCompleted: async () => undefined,
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
};
