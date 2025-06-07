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
  AnthropicIcon,
  CohereIcon,
  DeepSeekIcon,
  GoogleIcon,
  GroqIcon,
  MistralIcon,
  OpenAiIcon,
  VercelIcon,
  XaiIcon,
} from '../icons';

export type PriceBracket = 'lowest' | 'low' | 'high' | 'highest';

const million = 1000000;

type TersaTextModel = {
  icon: typeof OpenAiIcon;
  id: string;
  label: string;
  model: LanguageModelV1;
  getCost: ({ input, output }: { input: number; output: number }) => number;
  legacy?: boolean;
  priceIndicator?: PriceBracket;
  disabled?: boolean;
  default?: boolean;
};

// Median input cost: 2.7
export const textModels: {
  label: string;
  models: TersaTextModel[];
}[] = [
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-3.5-turbo',
        label: 'GPT-3.5 Turbo',
        model: openai('gpt-3.5-turbo'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.5;
          const outputCost = (output / million) * 1.5;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4',
        label: 'GPT-4',
        model: openai('gpt-4'),
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 30;
          const outputCost = (output / million) * 60;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4.1',
        label: 'GPT-4.1',
        model: openai('gpt-4.1'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 8;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4.1-mini',
        label: 'GPT-4.1 Mini',
        model: openai('gpt-4.1-mini'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.4;
          const outputCost = (output / million) * 1.6;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4.1-nano',
        label: 'GPT-4.1 Nano',
        model: openai('gpt-4.1-nano'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.4;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4o',
        label: 'GPT-4o',
        model: openai('gpt-4o'),
        default: true,
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4o-mini',
        label: 'GPT-4o Mini',
        model: openai('gpt-4o-mini'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o1',
        label: 'O1',
        model: openai('o1'),
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 60;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o1-mini',
        label: 'O1 Mini',
        model: openai('o1-mini'),
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o3',
        label: 'O3',
        model: openai('o3'),
        priceIndicator: 'high',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 10;
          const outputCost = (output / million) * 40;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o3-mini',
        label: 'O3 Mini',
        model: openai('o3-mini'),
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o4-mini',
        label: 'O4 Mini',
        model: openai('o4-mini'),
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 1.1;
          const outputCost = (output / million) * 4.4;

          return inputCost + outputCost;
        },
      },
    ],
  },
  {
    label: 'xAI',
    models: [
      {
        icon: XaiIcon,
        id: 'xai-grok-3',
        label: 'Grok-3',
        model: xai('grok-3'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
      {
        icon: XaiIcon,
        id: 'xai-grok-3-fast',
        label: 'Grok-3 Fast',
        model: xai('grok-3-fast'),
        priceIndicator: 'high',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 5;
          const outputCost = (output / million) * 25;

          return inputCost + outputCost;
        },
      },
      {
        icon: XaiIcon,
        id: 'xai-grok-3-mini',
        label: 'Grok-3 Mini',
        model: xai('grok-3-mini'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.3;
          const outputCost = (output / million) * 0.5;

          return inputCost + outputCost;
        },
      },
      {
        icon: XaiIcon,
        id: 'xai-grok-3-mini-fast',
        label: 'Grok-3 Mini Fast',
        model: xai('grok-3-mini-fast'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.6;
          const outputCost = (output / million) * 4;

          return inputCost + outputCost;
        },
      },
      {
        icon: XaiIcon,
        id: 'xai-grok-2',
        label: 'Grok 2',
        model: xai('grok-2'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      {
        icon: XaiIcon,
        id: 'xai-grok-beta',
        label: 'Grok Beta',
        model: xai('grok-beta'),
        priceIndicator: 'high',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 5;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
  },

  {
    label: 'Anthropic',
    models: [
      {
        icon: AnthropicIcon,
        id: 'anthropic-claude-4-opus-20250514',
        label: 'Claude 4 Opus',
        model: anthropic('claude-4-opus-20250514'),
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 75;

          return inputCost + outputCost;
        },
      },
      {
        icon: AnthropicIcon,
        id: 'anthropic-claude-4-sonnet-20250514',
        label: 'Claude 4 Sonnet',
        model: anthropic('claude-4-sonnet-20250514'),
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
      {
        icon: AnthropicIcon,
        id: 'anthropic-claude-3-5-haiku-latest',
        label: 'Claude 3.5 Haiku',
        model: anthropic('claude-3-5-haiku-latest'),
        priceIndicator: 'low',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.8;
          const outputCost = (output / million) * 4;

          return inputCost + outputCost;
        },
      },
      {
        icon: AnthropicIcon,
        id: 'anthropic-claude-3-5-sonnet-latest',
        label: 'Claude 3.5 Sonnet',
        model: anthropic('claude-3-5-sonnet-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
        legacy: true,
      },
      {
        icon: AnthropicIcon,
        id: 'anthropic-claude-3-haiku-20240307',
        label: 'Claude 3 Haiku',
        model: anthropic('claude-3-haiku-20240307'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.25;
          const outputCost = (output / million) * 1.25;

          return inputCost + outputCost;
        },
        legacy: true,
      },
      {
        icon: AnthropicIcon,
        id: 'anthropic-claude-3-7-sonnet-20250219',
        label: 'Claude 3.7 Sonnet',
        model: anthropic('claude-3-7-sonnet-20250219'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
      {
        icon: AnthropicIcon,
        id: 'anthropic-claude-3-opus-latest',
        label: 'Claude 3 Opus',
        model: anthropic('claude-3-opus-latest'),
        priceIndicator: 'highest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 15;
          const outputCost = (output / million) * 75;

          return inputCost + outputCost;
        },
      },
    ],
  },

  {
    label: 'Vercel',
    models: [
      {
        icon: VercelIcon,
        id: 'vercel-v0-1.0-md',
        label: 'v0-1.0-md',
        model: vercel('v0-1.0-md'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 3;
          const outputCost = (output / million) * 15;

          return inputCost + outputCost;
        },
      },
    ],
  },

  {
    label: 'Mistral',
    models: [
      {
        icon: MistralIcon,
        id: 'mistral-pixtral-large-latest',
        label: 'Pixtral Large',
        model: mistral('pixtral-large-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 6;

          return inputCost + outputCost;
        },
      },
      {
        icon: MistralIcon,
        id: 'mistral-mistral-large-latest',
        label: 'Mistral Large',
        model: mistral('mistral-large-latest'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2;
          const outputCost = (output / million) * 6;

          return inputCost + outputCost;
        },
      },
      {
        icon: MistralIcon,
        id: 'mistral-ministral-8b-latest',
        label: 'Ministral 8B',
        model: mistral('ministral-8b-latest'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.1;

          return inputCost + outputCost;
        },
      },
      {
        icon: MistralIcon,
        id: 'mistral-ministral-3b-latest',
        label: 'Ministral 3B',
        model: mistral('ministral-3b-latest'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.04;
          const outputCost = (output / million) * 0.04;

          return inputCost + outputCost;
        },
      },
    ],
  },

  {
    label: 'Google',
    models: [
      {
        icon: GoogleIcon,
        id: 'google-gemini-2.0-flash',
        label: 'Gemini 2.0 Flash',
        model: google('gemini-2.0-flash-001'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.1;
          const outputCost = (output / million) * 0.4;

          return inputCost + outputCost;
        },
      },
      {
        icon: GoogleIcon,
        id: 'google-gemini-1.5-flash',
        label: 'Gemini 1.5 Flash',
        model: google('gemini-1.5-flash'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
      {
        icon: GoogleIcon,
        id: 'google-gemini-1.5-pro',
        label: 'Gemini 1.5 Pro',
        model: google('gemini-1.5-pro'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
    ],
  },

  {
    label: 'DeepSeek',
    models: [
      {
        icon: DeepSeekIcon,
        id: 'deepseek-deepseek-chat',
        label: 'DeepSeek V3 (Chat)',
        model: deepseek('deepseek-chat'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.27;
          const outputCost = (output / million) * 1.1;

          return inputCost + outputCost;
        },
      },
      {
        icon: DeepSeekIcon,
        id: 'deepseek-deepseek-reasoner',
        label: 'DeepSeek R1 (Reasoner)',
        model: deepseek('deepseek-reasoner'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.55;
          const outputCost = (output / million) * 2.19;

          return inputCost + outputCost;
        },
      },
    ],
  },

  // {
  //   label: 'Cerebras',
  //   models: [
  //     {
  //       icon: CerebrasIcon,
  //       id: 'cerebras-llama3.1-8b',
  //       label: 'Llama 3.1 8B',
  //       model: cerebras('llama3.1-8b'),
  //       getCost: ({ input, output }: { input: number; output: number }) => {
  //         const inputCost = (input / million) * 0.1;
  //         const outputCost = (output / million) * 0.1;

  //         return inputCost + outputCost;
  //       },
  //     },
  //     {
  //       icon: CerebrasIcon,
  //       id: 'cerebras-llama3.3-70b',
  //       label: 'Llama 3.3 70B',
  //       model: cerebras('llama3.3-70b'),
  //       getCost: ({ input, output }: { input: number; output: number }) => {
  //         const inputCost = (input / million) * 0.85;
  //         const outputCost = (output / million) * 1.2;

  //         return inputCost + outputCost;
  //       },
  //     },
  //   ],
  // },

  {
    label: 'Groq',
    models: [
      {
        icon: GroqIcon,
        id: 'groq-meta-llama/llama-4-scout-17b-16e-instruct',
        label: 'Llama 4 Scout 17B',
        model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.11;
          const outputCost = (output / million) * 0.34;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'groq-llama-3.3-70b-versatile',
        label: 'Llama 3.3 70B Versatile',
        model: groq('llama-3.3-70b-versatile'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.59;
          const outputCost = (output / million) * 0.79;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'groq-llama-3.1-8b-instant',
        label: 'Llama 3.1 8B Instant',
        model: groq('llama-3.1-8b-instant'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.05;
          const outputCost = (output / million) * 0.08;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'groq-gemma2-9b-it',
        label: 'Gemma 2 9B',
        model: groq('gemma2-9b-it'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.2;
          const outputCost = (output / million) * 0.2;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'groq-deepseek-r1-distill-llama-70b',
        label: 'DeepSeek R1 Distill Llama 70B',
        model: wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.75;
          const outputCost = (output / million) * 0.99;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'groq-qwen-2.5-32b',
        label: 'Qwen 2.5 32B',
        model: groq('qwen-2.5-32b'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.29;
          const outputCost = (output / million) * 0.39;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'groq-mistral-saba-24b',
        label: 'Mistral Saba 24B',
        model: groq('mistral-saba-24b'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.79;
          const outputCost = (output / million) * 0.79;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'groq-llama-guard-3-8b',
        label: 'Llama Guard 3 8B',
        model: groq('llama-guard-3-8b'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.2;
          const outputCost = (output / million) * 0.2;

          return inputCost + outputCost;
        },
      },
    ],
  },
  {
    label: 'Cohere',
    models: [
      {
        icon: CohereIcon,
        id: 'cohere-command-a-03-2025',
        label: 'Command A',
        model: cohere('command-a-03-2025'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      {
        icon: CohereIcon,
        id: 'cohere-command-r',
        label: 'Command R',
        model: cohere('command-r'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.15;
          const outputCost = (output / million) * 0.6;

          return inputCost + outputCost;
        },
      },
      {
        icon: CohereIcon,
        id: 'cohere-command-r-plus',
        label: 'Command R Plus',
        model: cohere('command-r-plus'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      {
        icon: CohereIcon,
        id: 'cohere-command-r7b-12-2024',
        label: 'Command R7B',
        model: cohere('command-r7b-12-2024'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.0375;
          const outputCost = (output / million) * 0.15;

          return inputCost + outputCost;
        },
      },
    ],
  },
];
