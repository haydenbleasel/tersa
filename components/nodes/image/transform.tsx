import { getIncomers, useReactFlow } from "@xyflow/react";
import {
  ClockIcon,
  DownloadIcon,
  Loader2Icon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEventHandler,
  type ComponentProps,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { generateImageAction } from "@/app/actions/image/create";
import { editImageAction } from "@/app/actions/image/edit";
import { NodeLayout } from "@/components/nodes/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAnalytics } from "@/hooks/use-analytics";
import { download } from "@/lib/download";
import { handleError } from "@/lib/error/handle";
import { getImagesFromImageNodes, getTextFromTextNodes } from "@/lib/xyflow";
import { useGateway } from "@/providers/gateway/client";
import { useProject } from "@/providers/project";
import { ModelSelector } from "../model-selector";
import type { ImageNodeProps } from ".";

type ImageTransformProps = ImageNodeProps & {
  title: string;
};

const getDefaultModel = (
  models: Record<string, { default?: boolean }>
): string => {
  const defaultModel = Object.entries(models).find(
    ([_, model]) => model.default
  );

  if (defaultModel) {
    return defaultModel[0];
  }

  const firstModel = Object.keys(models)[0];

  if (!firstModel) {
    throw new Error("No image models available");
  }

  return firstModel;
};

export const ImageTransform = ({
  data,
  id,
  type,
  title,
}: ImageTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const project = useProject();
  const { imageModels } = useGateway();
  const modelId = data.model ?? getDefaultModel(imageModels);
  const analytics = useAnalytics();

  const handleGenerate = useCallback(async () => {
    if (loading || !project?.id) {
      return;
    }

    const incomers = getIncomers({ id }, getNodes(), getEdges());
    const textNodes = getTextFromTextNodes(incomers);
    const imageNodes = getImagesFromImageNodes(incomers);

    try {
      if (!(textNodes.length || imageNodes.length)) {
        throw new Error("No input provided");
      }

      setLoading(true);

      analytics.track("canvas", "node", "generate", {
        type,
        textPromptsLength: textNodes.length,
        imagePromptsLength: imageNodes.length,
        model: modelId,
        instructionsLength: data.instructions?.length ?? 0,
      });

      const response = imageNodes.length
        ? await editImageAction({
            images: imageNodes,
            instructions: data.instructions,
            nodeId: id,
            projectId: project.id,
            modelId,
          })
        : await generateImageAction({
            prompt: textNodes.join("\n"),
            modelId,
            instructions: data.instructions,
            projectId: project.id,
            nodeId: id,
          });

      if ("error" in response) {
        throw new Error(response.error);
      }

      updateNodeData(id, response.nodeData);

      toast.success("Image generated successfully");

      setTimeout(() => mutate("credits"), 5000);
    } catch (error) {
      handleError("Error generating image", error);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    project?.id,
    id,
    analytics,
    type,
    data.instructions,
    getEdges,
    modelId,
    getNodes,
    updateNodeData,
  ]);

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const toolbar = useMemo<ComponentProps<typeof NodeLayout>["toolbar"]>(() => {
    const availableModels = Object.fromEntries(
      Object.entries(imageModels).map(([key, model]) => [
        key,
        {
          ...model,
          disabled: model.disabled,
        },
      ])
    );

    const items: ComponentProps<typeof NodeLayout>["toolbar"] = [
      {
        children: (
          <ModelSelector
            className="w-[200px] rounded-full"
            id={id}
            onChange={(value) => updateNodeData(id, { model: value })}
            options={availableModels}
            value={modelId}
          />
        ),
      },
    ];

    items.push(
      loading
        ? {
            tooltip: "Generating...",
            children: (
              <Button className="rounded-full" disabled size="icon">
                <Loader2Icon className="animate-spin" size={12} />
              </Button>
            ),
          }
        : {
            tooltip: data.generated?.url ? "Regenerate" : "Generate",
            children: (
              <Button
                className="rounded-full"
                disabled={loading || !project?.id}
                onClick={handleGenerate}
                size="icon"
              >
                {data.generated?.url ? (
                  <RotateCcwIcon size={12} />
                ) : (
                  <PlayIcon size={12} />
                )}
              </Button>
            ),
          }
    );

    if (data.generated) {
      items.push({
        tooltip: "Download",
        children: (
          <Button
            className="rounded-full"
            onClick={() => download(data.generated, id, "png")}
            size="icon"
            variant="ghost"
          >
            <DownloadIcon size={12} />
          </Button>
        ),
      });
    }

    if (data.updatedAt) {
      items.push({
        tooltip: `Last updated: ${new Intl.DateTimeFormat("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(data.updatedAt))}`,
        children: (
          <Button className="rounded-full" size="icon" variant="ghost">
            <ClockIcon size={12} />
          </Button>
        ),
      });
    }

    return items;
  }, [
    modelId,
    imageModels,
    id,
    updateNodeData,
    loading,
    data.generated,
    data.updatedAt,
    handleGenerate,
    project?.id,
  ]);

  return (
    <NodeLayout data={data} id={id} title={title} toolbar={toolbar} type={type}>
      {loading ? (
        <Skeleton
          className="flex w-full animate-pulse items-center justify-center rounded-b-xl"
          style={{ aspectRatio: "1/1" }}
        >
          <Loader2Icon
            className="size-4 animate-spin text-muted-foreground"
            size={16}
          />
        </Skeleton>
      ) : null}
      {!(loading || data.generated?.url) && (
        <div
          className="flex w-full items-center justify-center rounded-b-xl bg-secondary p-4"
          style={{ aspectRatio: "1/1" }}
        >
          <p className="text-muted-foreground text-sm">
            Press <PlayIcon className="inline -translate-y-px" size={12} /> to
            create an image
          </p>
        </div>
      )}
      {!loading && data.generated?.url && (
        <Image
          alt="Generated image"
          className="w-full rounded-b-xl object-cover"
          height={1000}
          src={data.generated.url}
          width={1000}
        />
      )}
      <Textarea
        className="shrink-0 resize-none rounded-none border-none bg-transparent! shadow-none focus-visible:ring-0"
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        value={data.instructions ?? ""}
      />
    </NodeLayout>
  );
};
