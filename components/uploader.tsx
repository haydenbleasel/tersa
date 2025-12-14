import Image from "next/image";
import { type ReactNode, useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  type DropzoneProps,
} from "@/components/kibo-ui/dropzone";
import { handleError } from "@/lib/error/handle";
import { uploadFile } from "@/lib/upload";

type UploaderProps = {
  accept?: DropzoneProps["accept"];
  onUploadCompleted: (url: string, type: string) => void;
  className?: string;
  bucket?: "avatars" | "files";
  children?: ReactNode;
};

export const Uploader = ({
  onUploadCompleted,
  accept,
  className,
  bucket = "files",
  children,
}: UploaderProps) => {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = async (droppedFiles: File[]) => {
    try {
      if (!droppedFiles.length) {
        throw new Error("No file selected");
      }

      setFiles(droppedFiles);

      const { url, type } = await uploadFile(droppedFiles[0], bucket);

      onUploadCompleted(url, type);
    } catch (error) {
      handleError("Error uploading file", error);
    }
  };

  return (
    <Dropzone
      accept={accept}
      className={className}
      maxFiles={1}
      maxSize={1024 * 1024 * 10}
      minSize={1024}
      multiple={false}
      onDrop={handleDrop}
      onError={console.error}
      src={files}
    >
      {children ?? (
        <>
          <DropzoneEmptyState />
          <DropzoneContent>
            {files?.length ? (
              <div className="h-[102px] w-full">
                <Image
                  alt="Image preview"
                  className="absolute top-0 left-0 h-full w-full object-cover"
                  height={100}
                  src={URL.createObjectURL(files[0])}
                  unoptimized
                  width={100}
                />
              </div>
            ) : null}
          </DropzoneContent>
        </>
      )}
    </Dropzone>
  );
};
