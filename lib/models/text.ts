import { anthropic } from '@ai-sdk/anthropic';
import { cohere } from '@ai-sdk/cohere';
import { deepseek } from '@ai-sdk/deepseek';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';
import { openai } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import { vercel } from '@ai-sdk/vercel';
import { xai } from '@ai-sdk/xai';
import {
  type LanguageModelV1,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import {
  ClaudeIcon,
  GeminiIcon,
  GemmaIcon,
  GrokIcon,
  PerplexityIcon,
} from '../icons';
import { type TersaModel, type TersaProvider, providers } from '../providers';

export type PriceBracket = 'lowest' | 'low' | 'high' | 'highest';

const million = 1000000;
const thousand = 1000;

type TersaTextModel = TersaModel & {
  providers: (TersaProvider & {
    model: LanguageModelV1;
    getCost: ({ input, output }: { input: number; output: number }) => number;
  })[];
};

// Median input cost: 2.7
export const textModels: Record<string, TersaTextModel> = {
  'gpt-3.5-turbo': {
    label: 'GPT-3.5 Turbo',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-3.5-turbo'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.5;
          const outputCost = (output / million) * 1.5;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'gpt-4': {
    label: 'GPT-4',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 30;
          const outputCost = (output / million) * 60;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'highest',
  },
  'gpt-4.1': {
    label: 'GPT-4.1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4.1'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 8;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'gpt-4.1-mini': {
    label: 'GPT-4.1 Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4.1-mini'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.4;
          const outputCost = (output / million) * 1.6;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'gpt-4.1-nano': {
    label: 'GPT-4.1 Nano',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4.1-nano'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.4;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'gpt-4o': {
    label: 'GPT-4o',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4o'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
    ],
    default: true,
  },
  'gpt-4o-mini': {
    label: 'GPT-4o Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4o-mini'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  o1: {
    label: 'O1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o1'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 60;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'highest',
  },
  'o1-mini': {
    label: 'O1 Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o1-mini'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'low',
  },
  o3: {
    label: 'O3',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o3'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 8;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'high',
  },
  'o3-mini': {
    label: 'O3 Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o3-mini'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'low',
  },
  'o4-mini': {
    label: 'O4 Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o4-mini'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'low',
  },
  'grok-3': {
    icon: GrokIcon,
    label: 'Grok-3',
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai('grok-3'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'grok-3-fast': {
    icon: GrokIcon,
    label: 'Grok-3 Fast',
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai('grok-3-fast'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 5;
          const outputCost = (output / million) * 25;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'high',
  },
  'grok-3-mini': {
    icon: GrokIcon,
    label: 'Grok-3 Mini',
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai('grok-3-mini'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.3;
          const outputCost = (output / million) * 0.5;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'grok-3-mini-fast': {
    icon: GrokIcon,
    label: 'Grok-3 Mini Fast',
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai('grok-3-mini-fast'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.6;
          const outputCost = (output / million) * 4;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'grok-2': {
    icon: GrokIcon,
    label: 'Grok 2',
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai('grok-2'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'grok-beta': {
    icon: GrokIcon,
    label: 'Grok Beta',
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai('grok-beta'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 5;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'high',
  },

  'claude-4-opus-20250514': {
    icon: ClaudeIcon,
    label: 'Claude 4 Opus',
    chef: providers.anthropic,
    providers: [
      {
        ...providers.anthropic,
        model: anthropic('claude-4-opus-20250514'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 75;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'highest',
  },
  'claude-4-sonnet-20250514': {
    icon: ClaudeIcon,
    label: 'Claude 4 Sonnet',
    chef: providers.anthropic,
    providers: [
      {
        ...providers.anthropic,
        model: anthropic('claude-4-sonnet-20250514'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'low',
  },
  'claude-3-5-haiku-latest': {
    icon: ClaudeIcon,
    label: 'Claude 3.5 Haiku',
    chef: providers.anthropic,
    providers: [
      {
        ...providers.anthropic,
        model: anthropic('claude-3-5-haiku-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.8;
          const outputCost = (output / million) * 4;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'low',
  },
  'claude-3-5-sonnet-latest': {
    icon: ClaudeIcon,
    label: 'Claude 3.5 Sonnet',
    chef: providers.anthropic,
    providers: [
      {
        ...providers.anthropic,
        model: anthropic('claude-3-5-sonnet-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
    legacy: true,
  },
  'claude-3-haiku-20240307': {
    icon: ClaudeIcon,
    label: 'Claude 3 Haiku',
    chef: providers.anthropic,
    providers: [
      {
        ...providers.anthropic,
        model: anthropic('claude-3-haiku-20240307'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.25;
          const outputCost = (output / million) * 1.25;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
    legacy: true,
  },
  'claude-3-7-sonnet-20250219': {
    icon: ClaudeIcon,
    label: 'Claude 3.7 Sonnet',
    chef: providers.anthropic,
    providers: [
      {
        ...providers.anthropic,
        model: anthropic('claude-3-7-sonnet-20250219'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'claude-3-opus-latest': {
    icon: ClaudeIcon,
    label: 'Claude 3 Opus',
    chef: providers.anthropic,
    providers: [
      {
        ...providers.anthropic,
        model: anthropic('claude-3-opus-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 75;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'highest',
  },

  'vercel-v0-1.0-md': {
    label: 'v0-1.0-md',
    chef: providers.vercel,
    providers: [
      {
        ...providers.vercel,
        model: vercel('v0-1.0-md'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
  },

  'pixtral-large-latest': {
    label: 'Pixtral Large',
    chef: providers.mistral,
    providers: [
      {
        ...providers.mistral,
        model: mistral('pixtral-large-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 6;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'mistral-large-latest': {
    label: 'Mistral Large',
    chef: providers.mistral,
    providers: [
      {
        ...providers.mistral,
        model: mistral('mistral-large-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 6;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'ministral-8b-latest': {
    label: 'Ministral 8B',
    chef: providers.mistral,
    providers: [
      {
        ...providers.mistral,
        model: mistral('ministral-8b-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.1;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'ministral-3b-latest': {
    label: 'Ministral 3B',
    chef: providers.mistral,
    providers: [
      {
        ...providers.mistral,
        model: mistral('ministral-3b-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.04;
          const outputCost = (output / million) * 0.04;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'mistral-saba-24b': {
    label: 'Mistral Saba 24B',
    chef: providers.mistral,
    providers: [
      {
        ...providers.groq,
        model: groq('mistral-saba-24b'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.79;
          const outputCost = (output / million) * 0.79;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },

  'gemini-2.0-flash': {
    icon: GeminiIcon,
    label: 'Gemini 2.0 Flash',
    chef: providers.google,
    providers: [
      {
        ...providers.google,
        model: google('gemini-2.0-flash-001'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.4;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'gemini-1.5-flash': {
    icon: GeminiIcon,
    label: 'Gemini 1.5 Flash',
    chef: providers.google,
    providers: [
      {
        ...providers.google,
        model: google('gemini-1.5-flash'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'gemini-1.5-pro': {
    icon: GeminiIcon,
    label: 'Gemini 1.5 Pro',
    chef: providers.google,
    providers: [
      {
        ...providers.google,
        model: google('gemini-1.5-pro'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'gemma2-9b-it': {
    icon: GemmaIcon,
    label: 'Gemma 2 9B',
    chef: providers.google,
    providers: [
      {
        ...providers.groq,
        model: groq('gemma2-9b-it'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.2;
          const outputCost = (output / million) * 0.2;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },

  'deepseek-v3': {
    label: 'DeepSeek V3 (Chat)',
    chef: providers.deepseek,
    providers: [
      {
        ...providers.deepseek,
        model: deepseek('deepseek-chat'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.27;
          const outputCost = (output / million) * 1.1;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'deepseek-r1': {
    label: 'DeepSeek R1 (Reasoner)',
    chef: providers.deepseek,
    providers: [
      {
        ...providers.deepseek,
        model: deepseek('deepseek-reasoner'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.55;
          const outputCost = (output / million) * 2.19;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'deepseek-r1-distill-llama-70b': {
    label: 'DeepSeek R1 Distill Llama 70B',
    chef: providers.deepseek,
    providers: [
      {
        ...providers.groq,
        model: wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.75;
          const outputCost = (output / million) * 0.99;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },

  'llama-4-scout-17b-16e-instruct': {
    label: 'Llama 4 Scout 17B',
    chef: providers.meta,
    providers: [
      {
        ...providers.groq,
        model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.11;
          const outputCost = (output / million) * 0.34;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'llama-3.3-70b-versatile': {
    label: 'Llama 3.3 70B Versatile',
    chef: providers.meta,
    providers: [
      {
        ...providers.groq,
        model: groq('llama-3.3-70b-versatile'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.59;
          const outputCost = (output / million) * 0.79;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'llama-3.1-8b-instant': {
    label: 'Llama 3.1 8B Instant',
    chef: providers.meta,
    providers: [
      {
        ...providers.groq,
        model: groq('llama-3.1-8b-instant'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.05;
          const outputCost = (output / million) * 0.08;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'llama-guard-3-8b': {
    label: 'Llama Guard 3 8B',
    chef: providers.meta,
    providers: [
      {
        ...providers.groq,
        model: groq('llama-guard-3-8b'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.2;
          const outputCost = (output / million) * 0.2;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },

  'qwen-2.5-32b': {
    label: 'Qwen 2.5 32B',
    chef: providers['alibaba-cloud'],
    providers: [
      {
        ...providers.groq,
        model: groq('qwen-2.5-32b'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.29;
          const outputCost = (output / million) * 0.39;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },

  'command-a-03-2025': {
    label: 'Command A',
    chef: providers.cohere,
    providers: [
      {
        ...providers.cohere,
        model: cohere('command-a-03-2025'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'command-r': {
    label: 'Command R',
    chef: providers.cohere,
    providers: [
      {
        ...providers.cohere,
        model: cohere('command-r'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  'command-r-plus': {
    label: 'Command R Plus',
    chef: providers.cohere,
    providers: [
      {
        ...providers.cohere,
        model: cohere('command-r-plus'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
    ],
  },
  'command-r7b-12-2024': {
    label: 'Command R7B',
    chef: providers.cohere,
    providers: [
      {
        ...providers.cohere,
        model: cohere('command-r7b-12-2024'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.0375;
          const outputCost = (output / million) * 0.15;

          return inputCost + outputCost;
        },
      },
    ],
    priceIndicator: 'lowest',
  },
  sonar: {
    icon: PerplexityIcon,
    label: 'Sonar',
    chef: providers.perplexity,
    providers: [
      {
        ...providers.perplexity,
        model: perplexity('sonar'),

        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1;
          const outputCost = (output / million) * 1;
          const pricePerRequest = 12 / thousand;

          return inputCost + outputCost + pricePerRequest;
        },
      },
    ],
  },
  'sonar-pro': {
    icon: PerplexityIcon,
    label: 'Sonar Pro',
    chef: providers.perplexity,
    providers: [
      {
        ...providers.perplexity,
        model: perplexity('sonar-pro'),

        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;
          const pricePerRequest = 14 / thousand;

          return inputCost + outputCost + pricePerRequest;
        },
      },
    ],
  },
};
