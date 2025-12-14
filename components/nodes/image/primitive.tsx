import { useReactFlow } from "@xyflow/react";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { describeAction } from "@/app/actions/image/describe";
import { NodeLayout } from "@/components/nodes/layout";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import { Skeleton } from "@/components/ui/skeleton";
import { handleError } from "@/lib/error/handle";
import { uploadFile } from "@/lib/upload";
import { useProject } from "@/providers/project";
import type { ImageNodeProps } from ".";

type ImagePrimitiveProps = ImageNodeProps & {
  title: string;
};

export const ImagePrimitive = ({
  data,
  id,
  type,
  title,
}: ImagePrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const project = useProject();
  const [files, setFiles] = useState<File[] | undefined>();
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (droppedFiles: File[]) => {
    if (isUploading || !project?.id) {
      return;
    }

    try {
      if (!droppedFiles.length) {
        throw new Error("No file selected");
      }

      setIsUploading(true);
      setFiles(droppedFiles);
      const [file] = droppedFiles;
      const { url, type: contentType } = await uploadFile(file, "files");

      updateNodeData(id, {
        content: {
          url,
          type: contentType,
        },
      });

      const description = await describeAction(url, project?.id);

      if ("error" in description) {
        throw new Error(description.error);
      }

      updateNodeData(id, {
        description: description.description,
      });
    } catch (error) {
      handleError("Error uploading image", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NodeLayout data={data} id={id} title={title} type={type}>
      {isUploading ? (
        <Skeleton className="flex aspect-video w-full animate-pulse items-center justify-center">
          <Loader2Icon
            className="size-4 animate-spin text-muted-foreground"
            size={16}
          />
        </Skeleton>
      ) : null}
      {!isUploading && data.content && (
        <Image
          alt="Image"
          className="h-auto w-full"
          height={data.height ?? 1000}
          src={data.content.url}
          width={data.width ?? 1000}
        />
      )}
      {!(isUploading || data.content) && (
        <Dropzone
          accept={{
            "image/*": [],
          }}
          className="rounded-none border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          maxFiles={1}
          maxSize={1024 * 1024 * 10}
          minSize={1024}
          multiple={false}
          onDrop={handleDrop}
          onError={console.error}
          src={files}
        >
          <DropzoneEmptyState className="p-4" />
          <DropzoneContent />
        </Dropzone>
      )}
    </NodeLayout>
  );
};
