import { getIncomers, useReactFlow } from "@xyflow/react";
import {
  ClockIcon,
  DownloadIcon,
  Loader2Icon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import { type ChangeEventHandler, type ComponentProps, useState } from "react";
import { toast } from "sonner";
import { generateVideoAction } from "@/app/actions/video/create";
import { NodeLayout } from "@/components/nodes/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAnalytics } from "@/hooks/use-analytics";
import { download } from "@/lib/download";
import { handleError } from "@/lib/error/handle";
import { getImagesFromImageNodes, getTextFromTextNodes } from "@/lib/xyflow";
import { useGateway } from "@/providers/gateway/client";
import { ModelSelector } from "../model-selector";
import type { VideoNodeProps } from ".";

type VideoTransformProps = VideoNodeProps & {
  title: string;
};

const getDefaultModel = (models: Record<string, { default?: boolean }>) => {
  const defaultModel = Object.entries(models).find(
    ([_, model]) => model.default
  );

  if (defaultModel) {
    return defaultModel[0];
  }

  const firstModel = Object.keys(models)[0];

  if (!firstModel) {
    throw new Error("No video models available");
  }

  return firstModel;
};

export const VideoTransform = ({
  data,
  id,
  type,
  title,
}: VideoTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const { videoModels } = useGateway();
  const modelId = data.model ?? getDefaultModel(videoModels);
  const analytics = useAnalytics();

  const handleGenerate = async () => {
    if (loading) {
      return;
    }

    try {
      const incomers = getIncomers({ id }, getNodes(), getEdges());
      const textPrompts = getTextFromTextNodes(incomers);
      const images = getImagesFromImageNodes(incomers);

      if (!(textPrompts.length || images.length)) {
        throw new Error("No prompts found");
      }

      setLoading(true);

      analytics.track("canvas", "node", "generate", {
        type,
        promptLength: textPrompts.join("\n").length,
        model: modelId,
        instructionsLength: data.instructions?.length ?? 0,
      });

      const response = await generateVideoAction({
        modelId,
        prompt: [data.instructions ?? "", ...textPrompts].join("\n"),
        image: images.at(0)?.url,
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      updateNodeData(id, {
        updatedAt: new Date().toISOString(),
        generated: {
          url: response.url,
          type: response.type,
        },
      });

      toast.success("Video generated successfully");
    } catch (error) {
      handleError("Error generating video", error);
    } finally {
      setLoading(false);
    }
  };

  const toolbar: ComponentProps<typeof NodeLayout>["toolbar"] = [
    {
      children: (
        <ModelSelector
          className="w-[200px] rounded-full"
          key={id}
          onChange={(value) => updateNodeData(id, { model: value })}
          options={videoModels}
          value={modelId}
        />
      ),
    },
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
              disabled={loading}
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
        },
  ];

  if (data.generated?.url) {
    toolbar.push({
      tooltip: "Download",
      children: (
        <Button
          className="rounded-full"
          onClick={() => download(data.generated, id, "mp4")}
          size="icon"
          variant="ghost"
        >
          <DownloadIcon size={12} />
        </Button>
      ),
    });
  }

  if (data.updatedAt) {
    toolbar.push({
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

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  return (
    <NodeLayout data={data} id={id} title={title} toolbar={toolbar} type={type}>
      {loading ? (
        <Skeleton className="flex aspect-video w-full animate-pulse items-center justify-center rounded-b-xl">
          <Loader2Icon
            className="size-4 animate-spin text-muted-foreground"
            size={16}
          />
        </Skeleton>
      ) : null}
      {!(loading || data.generated?.url) && (
        <div className="flex aspect-video w-full items-center justify-center rounded-b-xl bg-secondary">
          <p className="text-muted-foreground text-sm">
            Press <PlayIcon className="inline -translate-y-px" size={12} /> to
            generate video
          </p>
        </div>
      )}
      {typeof data.generated?.url === "string" && !loading ? (
        <video
          autoPlay
          className="w-full rounded-b-xl object-cover"
          height={data.height ?? 450}
          loop
          muted
          playsInline
          src={data.generated.url}
          width={data.width ?? 800}
        />
      ) : null}
      <Textarea
        className="shrink-0 resize-none rounded-none border-none bg-transparent! shadow-none focus-visible:ring-0"
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        value={data.instructions ?? ""}
      />
    </NodeLayout>
  );
};
