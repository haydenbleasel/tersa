import { useReactFlow } from "@xyflow/react";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { transcribeAction } from "@/app/actions/speech/transcribe";
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
import type { AudioNodeProps } from ".";

type AudioPrimitiveProps = AudioNodeProps & {
  title: string;
};

export const AudioPrimitive = ({
  data,
  id,
  type,
  title,
}: AudioPrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const [files, setFiles] = useState<File[] | undefined>();
  const project = useProject();
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (files: File[]) => {
    if (isUploading || !project?.id) {
      return;
    }

    try {
      if (!files.length) {
        throw new Error("No file selected");
      }

      setIsUploading(true);
      setFiles(files);
      const [file] = files;

      const { url, type } = await uploadFile(file, "files");

      updateNodeData(id, {
        content: {
          url,
          type,
        },
      });

      const response = await transcribeAction(url, project?.id);

      if ("error" in response) {
        throw new Error(response.error);
      }

      updateNodeData(id, {
        transcript: response.transcript,
      });
    } catch (error) {
      handleError("Error uploading video", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NodeLayout data={data} id={id} title={title} type={type}>
      {isUploading && (
        <Skeleton className="flex h-[50px] w-full animate-pulse items-center justify-center">
          <Loader2Icon
            className="size-4 animate-spin text-muted-foreground"
            size={16}
          />
        </Skeleton>
      )}
      {!isUploading && data.content && (
        // biome-ignore lint/a11y/useMediaCaption: <explanation>
        <audio
          className="w-full rounded-none"
          controls
          src={data.content.url}
        />
      )}
      {!(isUploading || data.content) && (
        <Dropzone
          accept={{
            "audio/*": [],
          }}
          className="rounded-none border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          maxFiles={1}
          maxSize={1024 * 1024 * 10}
          minSize={1024}
          multiple={false}
          onDrop={handleDrop}
          onError={console.error}
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      )}
    </NodeLayout>
  );
};
