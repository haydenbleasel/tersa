import { useChat } from "@ai-sdk/react";
import { getIncomers, useReactFlow } from "@xyflow/react";
import { DefaultChatTransport, type FileUIPart } from "ai";
import {
  ClockIcon,
  CopyIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
} from "lucide-react";
import {
  type ChangeEventHandler,
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { NodeLayout } from "@/components/nodes/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAnalytics } from "@/hooks/use-analytics";
import { useReasoning } from "@/hooks/use-reasoning";
import { handleError } from "@/lib/error/handle";
import {
  getDescriptionsFromImageNodes,
  getImagesFromImageNodes,
  getTextFromTextNodes,
} from "@/lib/xyflow";
import { useGateway } from "@/providers/gateway/client";
import { ReasoningTunnel } from "@/tunnels/reasoning";
import { ModelSelector } from "../model-selector";
import type { TextNodeProps } from ".";

type TextTransformProps = TextNodeProps & {
  title: string;
};

const getDefaultModel = (models: ReturnType<typeof useGateway>["models"]) => {
  const defaultModel = Object.entries(models).find(
    ([_, model]) => model.default
  );

  if (!defaultModel) {
    return "o3";
  }

  return defaultModel[0];
};

export const TextTransform = ({
  data,
  id,
  type,
  title,
}: TextTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const { models } = useGateway();
  const modelId = data.model ?? getDefaultModel(models);
  const analytics = useAnalytics();
  const [reasoning, setReasoning] = useReasoning();
  const { sendMessage, messages, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => handleError("Error generating text", error),
    onFinish: ({ message, isError }) => {
      if (isError) {
        handleError("Error generating text", "Please try again later.");
        return;
      }

      updateNodeData(id, {
        generated: {
          text: message.parts.find((part) => part.type === "text")?.text ?? "",
          sources:
            message.parts?.filter((part) => part.type === "source-url") ?? [],
        },
        updatedAt: new Date().toISOString(),
      });

      setReasoning((oldReasoning) => ({
        ...oldReasoning,
        isGenerating: false,
      }));

      toast.success("Text generated successfully");
    },
  });

  const handleGenerate = useCallback(async () => {
    const incomers = getIncomers({ id }, getNodes(), getEdges());
    const textPrompts = getTextFromTextNodes(incomers);
    const images = getImagesFromImageNodes(incomers);
    const imageDescriptions = getDescriptionsFromImageNodes(incomers);

    if (!(textPrompts.length || data.instructions)) {
      handleError("Error generating text", "No prompts found");
      return;
    }

    const content: string[] = [];

    if (data.instructions) {
      content.push("--- Instructions ---", data.instructions);
    }

    if (textPrompts.length) {
      content.push("--- Text Prompts ---", ...textPrompts);
    }

    if (imageDescriptions.length) {
      content.push("--- Image Descriptions ---", ...imageDescriptions);
    }

    analytics.track("canvas", "node", "generate", {
      type,
      promptLength: content.join("\n").length,
      model: modelId,
      instructionsLength: data.instructions?.length ?? 0,
      imageCount: images.length,
    });

    const attachments: FileUIPart[] = [];

    for (const image of images) {
      attachments.push({
        mediaType: image.type,
        url: image.url,
        type: "file",
      });
    }

    setMessages([]);
    await sendMessage(
      {
        text: content.join("\n"),
        files: attachments,
      },
      {
        body: {
          modelId,
        },
      }
    );
  }, [
    sendMessage,
    data.instructions,
    getEdges,
    getNodes,
    id,
    modelId,
    type,
    analytics.track,
    setMessages,
  ]);

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }, []);

  const toolbar = useMemo(() => {
    const items: ComponentProps<typeof NodeLayout>["toolbar"] = [];

    items.push({
      children: (
        <ModelSelector
          className="w-[200px] rounded-full"
          key={id}
          onChange={(value) => updateNodeData(id, { model: value })}
          options={models}
          value={modelId}
        />
      ),
    });

    if (status === "submitted" || status === "streaming") {
      items.push({
        tooltip: "Stop",
        children: (
          <Button className="rounded-full" onClick={stop} size="icon">
            <SquareIcon size={12} />
          </Button>
        ),
      });
    } else if (messages.length || data.generated?.text) {
      const text = messages.length
        ? messages
            .filter((message) => message.role === "assistant")
            .map(
              (message) =>
                message.parts.find((part) => part.type === "text")?.text ?? ""
            )
            .join("\n")
        : data.generated?.text;

      items.push({
        tooltip: "Regenerate",
        children: (
          <Button className="rounded-full" onClick={handleGenerate} size="icon">
            <RotateCcwIcon size={12} />
          </Button>
        ),
      });
      items.push({
        tooltip: "Copy",
        children: (
          <Button
            className="rounded-full"
            disabled={!text}
            onClick={() => handleCopy(text ?? "")}
            size="icon"
            variant="ghost"
          >
            <CopyIcon size={12} />
          </Button>
        ),
      });
    } else {
      items.push({
        tooltip: "Generate",
        children: (
          <Button className="rounded-full" onClick={handleGenerate} size="icon">
            <PlayIcon size={12} />
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
    data.generated?.text,
    data.updatedAt,
    handleGenerate,
    updateNodeData,
    modelId,
    id,
    messages,
    status,
    stop,
    handleCopy,
    models,
  ]);

  const nonUserMessages = messages.filter((message) => message.role !== "user");

  useEffect(() => {
    const hasReasoning = messages.some((message) =>
      message.parts.some((part) => part.type === "reasoning")
    );

    if (hasReasoning && !reasoning.isReasoning && status === "streaming") {
      setReasoning({ isReasoning: true, isGenerating: true });
    }
  }, [messages, reasoning, status, setReasoning]);

  return (
    <NodeLayout data={data} id={id} title={title} toolbar={toolbar} type={type}>
      <div className="nowheel h-full max-h-[30rem] flex-1 overflow-auto rounded-t-3xl rounded-b-xl bg-secondary p-4">
        {status === "submitted" && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-60 animate-pulse rounded-lg" />
            <Skeleton className="h-4 w-40 animate-pulse rounded-lg" />
            <Skeleton className="h-4 w-50 animate-pulse rounded-lg" />
          </div>
        )}
        {typeof data.generated?.text === "string" &&
        nonUserMessages.length === 0 &&
        status !== "submitted" ? (
          <ReactMarkdown>{data.generated.text}</ReactMarkdown>
        ) : null}
        {!(data.generated?.text || nonUserMessages.length) &&
          status !== "submitted" && (
            <div className="flex aspect-video w-full items-center justify-center bg-secondary">
              <p className="text-muted-foreground text-sm">
                Press <PlayIcon className="inline -translate-y-px" size={12} />{" "}
                to generate text
              </p>
            </div>
          )}
        {Boolean(nonUserMessages.length) &&
          status !== "submitted" &&
          nonUserMessages.map((message) => (
            <Message
              className="p-0 [&>div]:max-w-none"
              from={message.role === "assistant" ? "assistant" : "user"}
              key={message.id}
            >
              <div>
                {Boolean(
                  message.parts.filter((part) => part.type === "source-url")
                    ?.length
                ) && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === "source-url"
                        ).length
                      }
                    />
                    <SourcesContent>
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map(({ url, title: sourceTitle }) => (
                          <Source
                            href={url}
                            key={url ?? ""}
                            title={sourceTitle ?? new URL(url).hostname}
                          />
                        ))}
                    </SourcesContent>
                  </Sources>
                )}
                <MessageContent className="bg-transparent p-0">
                  <MessageResponse>
                    {message.parts.find((part) => part.type === "text")?.text ??
                      ""}
                  </MessageResponse>
                </MessageContent>
              </div>
            </Message>
          ))}
      </div>
      <Textarea
        className="shrink-0 resize-none rounded-none border-none bg-transparent! shadow-none focus-visible:ring-0"
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        value={data.instructions ?? ""}
      />
      <ReasoningTunnel.In>
        {messages.flatMap((message) =>
          message.parts
            .filter((part) => part.type === "reasoning")
            .flatMap((part) => part.text ?? "")
        )}
      </ReasoningTunnel.In>
    </NodeLayout>
  );
};
