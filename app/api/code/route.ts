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
    messages: convertToModelMessages(messages),
    onError: (error) => {
      console.error(error);
    },
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
        action: "code",
        cost: inputCost * inputTokens + outputCost * outputTokens,
      });
    },
  });

  return result.toUIMessageStreamResponse();
};
