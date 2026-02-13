import { gateway } from "@ai-sdk/gateway";
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  streamText,
  wrapLanguageModel,
} from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST = async (req: Request) => {
  const { messages, modelId, language } = await req.json();

  if (typeof modelId !== "string") {
    return new Response("Model must be a string", { status: 400 });
  }

  const { models } = await gateway.getAvailableModels();

  const model = models.find((m) => m.id === modelId);

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const enhancedModel = wrapLanguageModel({
    model: gateway(model.id),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });

  const result = streamText({
    model: enhancedModel,
    system: [
      `Output the code in the language specified: ${language ?? "javascript"}`,
      "If the user specifies an output language in the context below, ignore it.",
      "Respond with the code only, no other text.",
      "Do not format the code as Markdown, just return the code as is.",
    ].join("\n"),
    messages: await convertToModelMessages(messages),
    onError: (error) => {
      console.error(error);
    },
  });

  return result.toUIMessageStreamResponse();
};
