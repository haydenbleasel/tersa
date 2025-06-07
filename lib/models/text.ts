import { anthropic } from '@ai-sdk/anthropic';
import { cohere } from '@ai-sdk/cohere';
import { deepseek } from '@ai-sdk/deepseek';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';
import { openai } from '@ai-sdk/openai';
import { vercel } from '@ai-sdk/vercel';
import { xai } from '@ai-sdk/xai';

import {
  type LanguageModelV1,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import {
  AlibabaCloudIcon,
  AnthropicIcon,
  ClaudeIcon,
  CohereIcon,
  DeepSeekIcon,
  GeminiIcon,
  GemmaIcon,
  GoogleIcon,
  GrokIcon,
  GroqIcon,
  MetaIcon,
  MistralIcon,
  OpenAiIcon,
  VercelIcon,
  XaiIcon,
} from '../icons';

export type PriceBracket = 'lowest' | 'low' | 'high' | 'highest';

const million = 1000000;

type TersaTextModel = {
  // Inherits from chef if not provided
  icon?: typeof OpenAiIcon;
  label: string;
  providers: {
    // Inherits from chef if not provided
    icon?: typeof OpenAiIcon;
    name: string;
    model: LanguageModelV1;
  }[];
  getCost: ({ input, output }: { input: number; output: number }) => number;
  legacy?: boolean;
  priceIndicator?: PriceBracket;
  disabled?: boolean;
  default?: boolean;
};

// Median input cost: 2.7
export const textModels: {
  icon: typeof OpenAiIcon;
  label: string;
  models: Record<string, TersaTextModel>;
}[] = [
  {
    label: 'OpenAI',
    icon: OpenAiIcon,
    models: {
      'gpt-3.5-turbo': {
        label: 'GPT-3.5 Turbo',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-3.5-turbo'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.5;
          const outputCost = (output / million) * 1.5;

          return inputCost + outputCost;
        },
      },
      'gpt-4': {
        label: 'GPT-4',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4'),
          },
        ],
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 30;
          const outputCost = (output / million) * 60;

          return inputCost + outputCost;
        },
      },
      'gpt-4.1': {
        label: 'GPT-4.1',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4.1'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 8;

          return inputCost + outputCost;
        },
      },
      'gpt-4.1-mini': {
        label: 'GPT-4.1 Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4.1-mini'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.4;
          const outputCost = (output / million) * 1.6;

          return inputCost + outputCost;
        },
      },
      'gpt-4.1-nano': {
        label: 'GPT-4.1 Nano',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4.1-nano'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.4;

          return inputCost + outputCost;
        },
      },
      'gpt-4o': {
        label: 'GPT-4o',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4o'),
          },
        ],
        default: true,
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      'gpt-4o-mini': {
        label: 'GPT-4o Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4o-mini'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
      o1: {
        label: 'O1',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o1'),
          },
        ],
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 60;

          return inputCost + outputCost;
        },
      },
      'o1-mini': {
        label: 'O1 Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o1-mini'),
          },
        ],
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
      o3: {
        label: 'O3',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o3'),
          },
        ],
        priceIndicator: 'high',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 10;
          const outputCost = (output / million) * 40;

          return inputCost + outputCost;
        },
      },
      'o3-mini': {
        label: 'O3 Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o3-mini'),
          },
        ],
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
      'o4-mini': {
        label: 'O4 Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o4-mini'),
          },
        ],
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
    },
  },
  {
    label: 'xAI',
    icon: XaiIcon,
    models: {
      'grok-3': {
        icon: GrokIcon,
        label: 'Grok-3',
        providers: [
          {
            name: 'xAI',
            model: xai('grok-3'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
      'grok-3-fast': {
        icon: GrokIcon,
        label: 'Grok-3 Fast',
        providers: [
          {
            name: 'xAI',
            model: xai('grok-3-fast'),
          },
        ],
        priceIndicator: 'high',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 5;
          const outputCost = (output / million) * 25;

          return inputCost + outputCost;
        },
      },
      'grok-3-mini': {
        icon: GrokIcon,
        label: 'Grok-3 Mini',
        providers: [
          {
            name: 'xAI',
            model: xai('grok-3-mini'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.3;
          const outputCost = (output / million) * 0.5;

          return inputCost + outputCost;
        },
      },
      'grok-3-mini-fast': {
        icon: GrokIcon,
        label: 'Grok-3 Mini Fast',
        providers: [
          {
            name: 'xAI',
            model: xai('grok-3-mini-fast'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.6;
          const outputCost = (output / million) * 4;

          return inputCost + outputCost;
        },
      },
      'grok-2': {
        icon: GrokIcon,
        label: 'Grok 2',
        providers: [
          {
            name: 'xAI',
            model: xai('grok-2'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      'grok-beta': {
        icon: GrokIcon,
        label: 'Grok Beta',
        providers: [
          {
            name: 'xAI',
            model: xai('grok-beta'),
          },
        ],
        priceIndicator: 'high',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 5;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'Anthropic',
    icon: AnthropicIcon,
    models: {
      'claude-4-opus-20250514': {
        icon: ClaudeIcon,
        label: 'Claude 4 Opus',
        providers: [
          {
            name: 'Anthropic',
            model: anthropic('claude-4-opus-20250514'),
          },
        ],
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 75;

          return inputCost + outputCost;
        },
      },
      'claude-4-sonnet-20250514': {
        icon: ClaudeIcon,
        label: 'Claude 4 Sonnet',
        providers: [
          {
            name: 'Anthropic',
            model: anthropic('claude-4-sonnet-20250514'),
          },
        ],
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
      'claude-3-5-haiku-latest': {
        icon: ClaudeIcon,
        label: 'Claude 3.5 Haiku',
        providers: [
          {
            name: 'Anthropic',
            model: anthropic('claude-3-5-haiku-latest'),
          },
        ],
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.8;
          const outputCost = (output / million) * 4;

          return inputCost + outputCost;
        },
      },
      'claude-3-5-sonnet-latest': {
        icon: ClaudeIcon,
        label: 'Claude 3.5 Sonnet',
        providers: [
          {
            name: 'Anthropic',
            model: anthropic('claude-3-5-sonnet-latest'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
        legacy: true,
      },
      'claude-3-haiku-20240307': {
        icon: ClaudeIcon,
        label: 'Claude 3 Haiku',
        providers: [
          {
            name: 'Anthropic',
            model: anthropic('claude-3-haiku-20240307'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.25;
          const outputCost = (output / million) * 1.25;

          return inputCost + outputCost;
        },
        legacy: true,
      },
      'claude-3-7-sonnet-20250219': {
        icon: ClaudeIcon,
        label: 'Claude 3.7 Sonnet',
        providers: [
          {
            name: 'Anthropic',
            model: anthropic('claude-3-7-sonnet-20250219'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
      'claude-3-opus-latest': {
        icon: ClaudeIcon,
        label: 'Claude 3 Opus',
        providers: [
          {
            name: 'Anthropic',
            model: anthropic('claude-3-opus-latest'),
          },
        ],
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 75;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'Vercel',
    icon: VercelIcon,
    models: {
      'vercel-v0-1.0-md': {
        label: 'v0-1.0-md',
        providers: [
          {
            name: 'Vercel',
            model: vercel('v0-1.0-md'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'Mistral',
    icon: MistralIcon,
    models: {
      'pixtral-large-latest': {
        label: 'Pixtral Large',
        providers: [
          {
            name: 'Mistral',
            model: mistral('pixtral-large-latest'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 6;

          return inputCost + outputCost;
        },
      },
      'mistral-large-latest': {
        label: 'Mistral Large',
        providers: [
          {
            name: 'Mistral',
            model: mistral('mistral-large-latest'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 6;

          return inputCost + outputCost;
        },
      },
      'ministral-8b-latest': {
        label: 'Ministral 8B',
        providers: [
          {
            name: 'Mistral',
            model: mistral('ministral-8b-latest'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.1;

          return inputCost + outputCost;
        },
      },
      'ministral-3b-latest': {
        icon: MistralIcon,
        label: 'Ministral 3B',
        providers: [
          {
            name: 'Mistral',
            model: mistral('ministral-3b-latest'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.04;
          const outputCost = (output / million) * 0.04;

          return inputCost + outputCost;
        },
      },
      'mistral-saba-24b': {
        label: 'Mistral Saba 24B',
        providers: [
          {
            name: 'Groq',
            model: groq('mistral-saba-24b'),
            icon: GroqIcon,
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.79;
          const outputCost = (output / million) * 0.79;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'Google',
    icon: GoogleIcon,
    models: {
      'gemini-2.0-flash': {
        icon: GeminiIcon,
        label: 'Gemini 2.0 Flash',
        providers: [
          {
            name: 'Google',
            model: google('gemini-2.0-flash-001'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.4;

          return inputCost + outputCost;
        },
      },
      'gemini-1.5-flash': {
        icon: GeminiIcon,
        label: 'Gemini 1.5 Flash',
        providers: [
          {
            name: 'Google',
            model: google('gemini-1.5-flash'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
      'gemini-1.5-pro': {
        icon: GeminiIcon,
        label: 'Gemini 1.5 Pro',
        providers: [
          {
            name: 'Google',
            model: google('gemini-1.5-pro'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      'gemma2-9b-it': {
        icon: GemmaIcon,
        label: 'Gemma 2 9B',
        providers: [
          {
            name: 'Groq',
            model: groq('gemma2-9b-it'),
            icon: GroqIcon,
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.2;
          const outputCost = (output / million) * 0.2;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'DeepSeek',
    icon: DeepSeekIcon,
    models: {
      'deepseek-v3': {
        label: 'DeepSeek V3 (Chat)',
        providers: [
          {
            name: 'DeepSeek',
            model: deepseek('deepseek-chat'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.27;
          const outputCost = (output / million) * 1.1;

          return inputCost + outputCost;
        },
      },
      'deepseek-r1': {
        label: 'DeepSeek R1 (Reasoner)',
        providers: [
          {
            name: 'DeepSeek',
            model: deepseek('deepseek-reasoner'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.55;
          const outputCost = (output / million) * 2.19;

          return inputCost + outputCost;
        },
      },
      'deepseek-r1-distill-llama-70b': {
        icon: GroqIcon,
        label: 'DeepSeek R1 Distill Llama 70B',
        providers: [
          {
            name: 'Groq',
            icon: GroqIcon,
            model: wrapLanguageModel({
              model: groq('deepseek-r1-distill-llama-70b'),
              middleware: extractReasoningMiddleware({ tagName: 'think' }),
            }),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.75;
          const outputCost = (output / million) * 0.99;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'Meta',
    icon: MetaIcon,
    models: {
      'llama-4-scout-17b-16e-instruct': {
        label: 'Llama 4 Scout 17B',
        providers: [
          {
            name: 'Groq',
            icon: GroqIcon,
            model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.11;
          const outputCost = (output / million) * 0.34;

          return inputCost + outputCost;
        },
      },
      'llama-3.3-70b-versatile': {
        label: 'Llama 3.3 70B Versatile',
        providers: [
          {
            name: 'Groq',
            icon: GroqIcon,
            model: groq('llama-3.3-70b-versatile'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.59;
          const outputCost = (output / million) * 0.79;

          return inputCost + outputCost;
        },
      },
      'llama-3.1-8b-instant': {
        label: 'Llama 3.1 8B Instant',
        providers: [
          {
            name: 'Groq',
            icon: GroqIcon,
            model: groq('llama-3.1-8b-instant'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.05;
          const outputCost = (output / million) * 0.08;

          return inputCost + outputCost;
        },
      },
      'llama-guard-3-8b': {
        label: 'Llama Guard 3 8B',
        providers: [
          {
            name: 'Groq',
            icon: GroqIcon,
            model: groq('llama-guard-3-8b'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.2;
          const outputCost = (output / million) * 0.2;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'Alibaba',
    icon: AlibabaCloudIcon,
    models: {
      'qwen-2.5-32b': {
        icon: GroqIcon,
        label: 'Qwen 2.5 32B',
        providers: [
          {
            name: 'Groq',
            icon: GroqIcon,
            model: groq('qwen-2.5-32b'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.29;
          const outputCost = (output / million) * 0.39;

          return inputCost + outputCost;
        },
      },
    },
  },

  {
    label: 'Cohere',
    icon: CohereIcon,
    models: {
      'command-a-03-2025': {
        label: 'Command A',
        providers: [
          {
            name: 'Cohere',
            model: cohere('command-a-03-2025'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      'command-r': {
        label: 'Command R',
        providers: [
          {
            name: 'Cohere',
            model: cohere('command-r'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
      'command-r-plus': {
        label: 'Command R Plus',
        providers: [
          {
            name: 'Cohere',
            model: cohere('command-r-plus'),
          },
        ],
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      'command-r7b-12-2024': {
        label: 'Command R7B',
        providers: [
          {
            name: 'Cohere',
            model: cohere('command-r7b-12-2024'),
          },
        ],
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.0375;
          const outputCost = (output / million) * 0.15;

          return inputCost + outputCost;
        },
      },
    },
  },
];
