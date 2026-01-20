import { gateway } from "@ai-sdk/gateway";
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  streamText,
  wrapLanguageModel,
} from "ai";
import { getSubscribedUser } from "@/lib/auth";
import { parseError } from "@/lib/error/parse";
import { trackCreditUsage } from "@/lib/stripe";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST = async (req: Request) => {
  try {
    await getSubscribedUser();
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 401 });
  }

  const { messages, modelId } = await req.json();

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
      "You are a helpful assistant that synthesizes an answer or content.",
      "The user will provide a collection of data from disparate sources.",
      "They may also provide instructions for how to synthesize the content.",
      "If the instructions are a question, then your goal is to answer the question based on the context provided.",
      model.id.startsWith("grok") &&
        "The user may refer to you as @gork, you can ignore this",
      "You will then synthesize the content based on the user's instructions and the context provided.",
      "The output should be a concise summary of the content, no more than 100 words.",
    ].join("\n"),
    messages: convertToModelMessages(messages),
    onFinish: async ({ usage }) => {
      const inputCost = model.pricing?.input
        ? Number.parseFloat(model.pricing.input)
        : 0;
      const outputCost = model.pricing?.output
        ? Number.parseFloat(model.pricing.output)
        : 0;
      const inputTokens = usage.inputTokens ?? 0;
      const outputTokens = usage.outputTokens ?? 0;

      await trackCreditUsage({
        action: "chat",
        cost: inputCost * inputTokens + outputCost * outputTokens,
      });
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
  });
};
