import { bedrock } from '@ai-sdk/amazon-bedrock';
import { anthropic } from '@ai-sdk/anthropic';
import { deepseek } from '@ai-sdk/deepseek';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { hume } from '@ai-sdk/hume';
import { lmnt } from '@ai-sdk/lmnt';
import { mistral } from '@ai-sdk/mistral';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';

import type { ImageModel, LanguageModelV1, SpeechModel } from 'ai';
import {
  AmazonIcon,
  AnthropicIcon,
  DeepSeekIcon,
  GoogleIcon,
  GroqIcon,
  HumeIcon,
  LmntIcon,
  LumaIcon,
  MinimaxIcon,
  MistralIcon,
  OpenAiIcon,
  RunwayIcon,
  XaiIcon,
} from './icons';

export type PriceBracket = 'lowest' | 'low' | 'high' | 'highest';

const million = 1000000;
const thousand = 1000;

// Median input cost: 2.7
export const chatModels: {
  label: string;
  models: {
    icon: typeof OpenAiIcon;
    id: string;
    label: string;
    model: LanguageModelV1;
    getCost: ({ input, output }: { input: number; output: number }) => number;
    legacy?: boolean;
    priceIndicator?: PriceBracket;
    disabled?: boolean;
  }[];
}[] = [
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'gpt-3.5-turbo',
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
        id: 'gpt-4',
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
        id: 'gpt-4.1',
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
        id: 'gpt-4.1-mini',
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
        id: 'gpt-4.1-nano',
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
        id: 'gpt-4o',
        label: 'GPT-4o',
        model: openai('gpt-4o'),
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 2.5;
          const outputCost = (output / million) * 10;

          return inputCost + outputCost;
        },
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4o-mini',
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
        id: 'o1',
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
        id: 'o1-mini',
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
        id: 'o3',
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
        id: 'o3-mini',
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
        id: 'o4-mini',
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
        id: 'grok-3',
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
        id: 'grok-3-fast',
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
        id: 'grok-3-mini',
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
        id: 'grok-3-mini-fast',
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
        id: 'grok-2',
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
        id: 'grok-beta',
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
        id: 'claude-3-5-haiku-latest',
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
        id: 'claude-3-5-sonnet-latest',
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
        id: 'claude-3-haiku-20240307',
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
        id: 'claude-3-7-sonnet-20250219',
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
        id: 'claude-3-opus-latest',
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
    label: 'Mistral',
    models: [
      {
        icon: MistralIcon,
        id: 'pixtral-large-latest',
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
        id: 'mistral-large-latest',
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
        id: 'ministral-8b-latest',
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
        id: 'ministral-3b-latest',
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
        id: 'gemini-2.0-flash',
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
        id: 'gemini-1.5-flash',
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
        id: 'gemini-1.5-pro',
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
        id: 'deepseek-chat',
        label: 'DeepSeek Chat',
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
        id: 'deepseek-reasoner',
        label: 'DeepSeek Reasoner',
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
  //       id: 'llama3.1-8b',
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
  //       id: 'llama3.3-70b',
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
        id: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
        id: 'llama-3.3-70b-versatile',
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
        id: 'llama-3.1-8b-instant',
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
        id: 'gemma2-9b-it',
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
        id: 'deepseek-r1-distill-llama-70b',
        label: 'DeepSeek R1 Distill Llama 70B',
        model: groq('deepseek-r1-distill-llama-70b'),
        priceIndicator: 'lowest',
        getCost: ({ input, output }: { input: number; output: number }) => {
          const inputCost = (input / million) * 0.75;
          const outputCost = (output / million) * 0.99;

          return inputCost + outputCost;
        },
      },
      {
        icon: GroqIcon,
        id: 'qwen-2.5-32b',
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
        id: 'mistral-saba-24b',
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
        id: 'llama-guard-3-8b',
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
];

export const imageModels: {
  label: string;
  models: {
    icon: typeof XaiIcon;
    id: string;
    label: string;
    model: ImageModel;
    size?: string;
    getCost: (props?: {
      textInput?: number;
      imageInput?: number;
      output: number;
    }) => number;
    supportsEdit?: boolean;
    disabled?: boolean;
    providerOptions?: Record<string, Record<string, string>>;
    priceIndicator?: 'lowest' | 'low' | 'high' | 'highest';
  }[];
}[] = [
  {
    label: 'xAI',
    models: [
      {
        icon: XaiIcon,
        id: 'grok-2-image',
        label: 'Grok',
        model: xai.image('grok-2-image'),

        // xAI does not support size or quality
        // size: '1024x1024',
        // providerOptions: {},

        // https://docs.x.ai/docs/models#models-and-pricing
        getCost: () => 0.07,
      },
    ],
  },
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'dall-e-3',
        label: 'DALL-E 3',
        model: openai.image('dall-e-3'),
        size: '1024x1024',
        providerOptions: {
          openai: {
            quality: 'hd',
          },
        },

        // https://platform.openai.com/docs/pricing#image-generation
        getCost: () => 0.08,
      },
      {
        icon: OpenAiIcon,
        id: 'dall-e-2',
        label: 'DALL-E 2',
        model: openai.image('dall-e-2'),
        size: '1024x1024',
        providerOptions: {
          openai: {
            quality: 'standard',
          },
        },

        // https://platform.openai.com/docs/pricing#image-generation
        getCost: () => 0.02,
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-image-1',
        label: 'GPT Image 1',
        model: openai.image('gpt-image-1'),
        supportsEdit: true,
        size: '1024x1024',
        providerOptions: {
          openai: {
            quality: 'high',
          },
        },

        // Input (Text): https://platform.openai.com/docs/pricing#latest-models
        // Input (Image): https://platform.openai.com/docs/pricing#text-generation
        // Output: https://platform.openai.com/docs/pricing#image-generation

        getCost: (props) => {
          if (!props) {
            throw new Error('Props are required');
          }

          const { textInput, imageInput, output } = props;
          const textInputCost = textInput ? (textInput / million) * 5 : 0;
          const imageInputCost = imageInput ? (imageInput / million) * 10 : 0;
          const outputCost = (output / million) * 0.167;

          return textInputCost + imageInputCost + outputCost;
        },
      },
    ],
  },
  {
    label: 'Amazon Bedrock',
    models: [
      {
        icon: AmazonIcon,
        id: 'amazon.nova-canvas-v1:0',
        label: 'Nova Canvas',
        model: bedrock.image('amazon.nova-canvas-v1:0'),

        // Each side must be between 320-4096 pixels, inclusive.
        size: '2048x2048',

        providerOptions: {
          bedrock: {
            quality: 'premium',
          },
        },

        // https://aws.amazon.com/bedrock/pricing/
        getCost: () => 0.08,
      },
    ],
  },
  // {
  //   label: 'Fal',
  //   models: [
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/flux/dev',
  //       label: 'Flux Dev',
  //       model: fal.image('fal-ai/flux/dev'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/flux-lora',
  //       label: 'Flux Lora',
  //       model: fal.image('fal-ai/flux-lora'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/fast-sdxl',
  //       label: 'Fast SDXL',
  //       model: fal.image('fal-ai/fast-sdxl'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/flux-pro/v1.1-ultra',
  //       label: 'Flux Pro Ultra',
  //       model: fal.image('fal-ai/flux-pro/v1.1-ultra'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/ideogram/v2',
  //       label: 'Ideogram v2',
  //       model: fal.image('fal-ai/ideogram/v2'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/recraft-v3',
  //       label: 'Recraft v3',
  //       model: fal.image('fal-ai/recraft-v3'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/stable-diffusion-3.5-large',
  //       label: 'SD 3.5 Large',
  //       model: fal.image('fal-ai/stable-diffusion-3.5-large'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/hyper-sdxl',
  //       label: 'Hyper SDXL',
  //       model: fal.image('fal-ai/hyper-sdxl'),
  //     },
  //   ],
  // },
  // {
  //   label: 'DeepInfra',
  //   models: [
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'stabilityai/sd3.5',
  //       label: 'SD 3.5',
  //       model: deepinfra.image('stabilityai/sd3.5'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-1.1-pro',
  //       label: 'FLUX 1.1 Pro',
  //       model: deepinfra.image('black-forest-labs/FLUX-1.1-pro'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-1-schnell',
  //       label: 'FLUX 1 Schnell',
  //       model: deepinfra.image('black-forest-labs/FLUX-1-schnell'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-1-dev',
  //       label: 'FLUX 1 Dev',
  //       model: deepinfra.image('black-forest-labs/FLUX-1-dev'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-pro',
  //       label: 'FLUX Pro',
  //       model: deepinfra.image('black-forest-labs/FLUX-pro'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'stabilityai/sd3.5-medium',
  //       label: 'SD 3.5 Medium',
  //       model: deepinfra.image('stabilityai/sd3.5-medium'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'stabilityai/sdxl-turbo',
  //       label: 'SDXL Turbo',
  //       model: deepinfra.image('stabilityai/sdxl-turbo'),
  //     },
  //   ],
  // },
  // {
  //   label: 'Replicate',
  //   models: [
  //     {
  //       icon: ReplicateIcon,
  //       id: 'black-forest-labs/flux-schnell',
  //       label: 'Flux Schnell',
  //       model: replicate.image('black-forest-labs/flux-schnell'),
  //     },
  //     {
  //       icon: ReplicateIcon,
  //       id: 'recraft-ai/recraft-v3',
  //       label: 'Recraft v3',
  //       model: replicate.image('recraft-ai/recraft-v3'),
  //     },
  //   ],
  // },
  // {
  //   label: 'Google Vertex',
  //   models: [
  //     {
  //       icon: GoogleIcon,
  //       id: 'imagen-3.0-generate-001',
  //       label: 'Imagen 3.0',
  //       model: googlevertex.image('imagen-3.0-generate-001'),
  //     },
  //     {
  //       icon: GoogleIcon,
  //       id: 'imagen-3.0-fast-generate-001',
  //       label: 'Imagen 3.0 Fast',
  //       model: googlevertex.image('imagen-3.0-fast-generate-001'),
  //     },
  //   ],
  // },
  // {
  //   label: 'Fireworks',
  //   models: [
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/flux-1-dev-fp8',
  //       label: 'Flux 1 Dev FP8',
  //       model: fireworks.image('accounts/fireworks/models/flux-1-dev-fp8'),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/flux-1-schnell-fp8',
  //       label: 'Flux 1 Schnell FP8',
  //       model: fireworks.image('accounts/fireworks/models/flux-1-schnell-fp8'),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/playground-v2-5-1024px-aesthetic',
  //       label: 'Playground v2.5',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/playground-v2-5-1024px-aesthetic'
  //       ),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/japanese-stable-diffusion-xl',
  //       label: 'Japanese SDXL',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/japanese-stable-diffusion-xl'
  //       ),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/playground-v2-1024px-aesthetic',
  //       label: 'Playground v2',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/playground-v2-1024px-aesthetic'
  //       ),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/SSD-1B',
  //       label: 'SSD-1B',
  //       model: fireworks.image('accounts/fireworks/models/SSD-1B'),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0',
  //       label: 'SDXL 1.0',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0'
  //       ),
  //     },
  //   ],
  // },
  // {
  //   label: 'Luma',
  //   models: [
  //     {
  //       icon: LumaIcon,
  //       id: 'photon-1',
  //       label: 'Photon 1',
  //       model: luma.image('photon-1'),

  //       getCost: (width: number, height: number) => {
  //         const pixels = width * height;

  //         return (pixels / million) * 0.0073;
  //       },
  //     },
  //     {
  //       icon: LumaIcon,
  //       id: 'photon-flash-1',
  //       label: 'Photon Flash 1',
  //       model: luma.image('photon-flash-1'),

  //       getCost: (width: number, height: number) => {
  //         const pixels = width * height;

  //         return (pixels / million) * 0.0019;
  //       },
  //     },
  //   ],
  // },
  // {
  //   label: 'Together.ai',
  //   models: [
  //     {
  //       icon: TogetherIcon,
  //       id: 'stabilityai/stable-diffusion-xl-base-1.0',
  //       label: 'SDXL Base 1.0',
  //       model: togetherai.image('stabilityai/stable-diffusion-xl-base-1.0'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-dev',
  //       label: 'FLUX.1 Dev',
  //       model: togetherai.image('black-forest-labs/FLUX.1-dev'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-dev-lora',
  //       label: 'FLUX.1 Dev Lora',
  //       model: togetherai.image('black-forest-labs/FLUX.1-dev-lora'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-schnell',
  //       label: 'FLUX.1 Schnell',
  //       model: togetherai.image('black-forest-labs/FLUX.1-schnell'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-canny',
  //       label: 'FLUX.1 Canny',
  //       model: togetherai.image('black-forest-labs/FLUX.1-canny'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-depth',
  //       label: 'FLUX.1 Depth',
  //       model: togetherai.image('black-forest-labs/FLUX.1-depth'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-redux',
  //       label: 'FLUX.1 Redux',
  //       model: togetherai.image('black-forest-labs/FLUX.1-redux'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1.1-pro',
  //       label: 'FLUX.1.1 Pro',
  //       model: togetherai.image('black-forest-labs/FLUX.1.1-pro'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-pro',
  //       label: 'FLUX.1 Pro',
  //       model: togetherai.image('black-forest-labs/FLUX.1-pro'),
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'black-forest-labs/FLUX.1-schnell-Free',
  //       label: 'FLUX.1 Schnell Free',
  //       model: togetherai.image('black-forest-labs/FLUX.1-schnell-Free'),
  //     },
  //   ],
  // },
];

export const speechModels: {
  label: string;
  models: {
    icon: typeof OpenAiIcon;
    id: string;
    label: string;
    model: SpeechModel;
    voices: string[];
    getCost: (tokens: number) => number;
  }[];
}[] = [
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'tts-1',
        label: 'TTS-1',
        model: openai.speech('tts-1'),
        getCost: (characters: number) => (characters / million) * 15,
        voices: [
          'alloy',
          'ash',
          'ballad',
          'coral',
          'echo',
          'fable',
          'nova',
          'onyx',
          'sage',
          'shimmer',
        ],
      },
      {
        icon: OpenAiIcon,
        id: 'tts-1-hd',
        label: 'TTS-1-HD',
        model: openai.speech('tts-1-hd'),
        getCost: (characters: number) => (characters / million) * 30,
        voices: [
          'alloy',
          'ash',
          'ballad',
          'coral',
          'echo',
          'fable',
          'nova',
          'onyx',
          'sage',
          'shimmer',
        ],
      },
      // {
      //   icon: OpenAiIcon,
      //   id: 'gpt-4o-mini-tts',
      //   label: 'GPT-4o Mini TTS',
      //   model: openai.speech('gpt-4o-mini-tts'),
      //   getCost: (tokens: number) => (tokens / million) * 0.6,
      // },
    ],
  },
  {
    label: 'LMNT',
    models: [
      {
        icon: LmntIcon,
        id: 'aurora',
        label: 'Aurora',
        model: lmnt.speech('aurora'),
        getCost: (characters: number) => (characters / thousand) * 0.05,
        voices: [
          'amy',
          'ava',
          'caleb',
          'chloe',
          'dalton',
          'daniel',
          'james',
          'lauren',
          'lily',
          'magnus',
          'miles',
          'morgan',
          'nathan',
          'noah',
          'oliver',
          'paige',
          'sophie',
          'terrence',
          'zain',
          'zeke',
          'zoe',
        ],
      },
      {
        icon: LmntIcon,
        id: 'blizzard',
        label: 'Blizzard',
        model: lmnt.speech('blizzard'),
        getCost: (characters: number) => (characters / thousand) * 0.05,
        voices: [
          'amy',
          'ava',
          'caleb',
          'chloe',
          'dalton',
          'daniel',
          'james',
          'lauren',
          'lily',
          'magnus',
          'miles',
          'morgan',
          'nathan',
          'noah',
          'oliver',
          'paige',
          'sophie',
          'terrence',
          'zain',
          'zeke',
          'zoe',
        ],
      },
    ],
  },
  {
    label: 'Hume',
    models: [
      {
        icon: HumeIcon,
        id: 'default',
        label: 'Default',
        model: hume.speech(),
        // Creator plan pricing
        getCost: (characters: number) => (characters / thousand) * 0.2,
        voices: [],
      },
    ],
  },
];

export const visionModels = [
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'gpt-4.1',
        label: 'GPT-4.1',
        model: openai('gpt-4.1'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4.1-mini',
        label: 'GPT-4.1 Mini',
        model: openai('gpt-4.1-mini'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4.1-nano',
        label: 'GPT-4.1 Nano',
        model: openai('gpt-4.1-nano'),
      },
      {
        icon: OpenAiIcon,
        id: 'o3',
        label: 'O3',
        model: openai('o3'),
      },
      {
        icon: OpenAiIcon,
        id: 'o4-mini',
        label: 'O4 Mini',
        model: openai('o4-mini'),
      },
      {
        icon: OpenAiIcon,
        id: 'o1',
        label: 'O1',
        model: openai('o1'),
      },
      {
        icon: OpenAiIcon,
        id: 'o1-pro',
        label: 'O1 Pro',
        model: openai('o1-pro'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4o',
        label: 'GPT-4o',
        model: openai('gpt-4o'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4o-2024-05-13',
        label: 'GPT-4o (2024-05-13)',
        model: openai('gpt-4o-2024-05-13'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4o-mini',
        label: 'GPT-4o Mini',
        model: openai('gpt-4o-mini'),
      },
      {
        icon: OpenAiIcon,
        id: 'computer-use-preview',
        label: 'Computer Use Preview',
        model: openai('computer-use-preview'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4.5-preview',
        label: 'GPT-4.5 Preview',
        model: openai('gpt-4.5-preview'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-image-1',
        label: 'GPT Image 1',
        model: openai('gpt-image-1'),
      },
    ],
  },
];

export const transcriptionModels = [
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'gpt-4o-mini-transcribe',
        label: 'GPT-4o Mini Transcribe',
        model: openai.transcription('gpt-4o-mini-transcribe'),
      },
      {
        icon: OpenAiIcon,
        id: 'whisper-1',
        label: 'Whisper 1',
        model: openai.transcription('whisper-1'),
      },
      {
        icon: OpenAiIcon,
        id: 'gpt-4o-transcribe',
        label: 'GPT-4o Transcribe',
        model: openai.transcription('gpt-4o-transcribe'),
      },
    ],
  },
];

export const videoModels: {
  label: string;
  models: {
    icon: typeof MinimaxIcon;
    id: string;
    label: string;
    model: string;
    getCost: () => number;
  }[];
}[] = [
  {
    label: 'Minimax',
    models: [
      {
        icon: MinimaxIcon,
        id: 'minimax-t2v-01-director',
        label: 'T2V-01-Director',
        model: 'T2V-01-Director',

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-i2v-01-director',
        label: 'I2V-01-Director',
        model: 'I2V-01-Director',

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-s2v-01',
        label: 'S2V-01',
        model: 'S2V-01',

        // https://www.minimax.io/price
        getCost: () => 0.65,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-i2v-01',
        label: 'I2V-01',
        model: 'I2V-01',

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-i2v-01-live',
        label: 'I2V-01-live',
        model: 'I2V-01-live',

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-t2v-01',
        label: 'T2V-01',
        model: 'T2V-01',

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
    ],
  },
  {
    label: 'Runway',
    models: [
      {
        icon: RunwayIcon,
        id: 'runway-gen4-turbo',
        label: 'Gen4 Turbo',
        model: 'gen4_turbo',

        // https://docs.dev.runwayml.com/#price
        getCost: () => 0.5,
      },
      {
        icon: RunwayIcon,
        id: 'runway-gen3a-turbo',
        label: 'Gen3a Turbo',
        model: 'gen3a_turbo',

        // https://docs.dev.runwayml.com/#price
        getCost: () => 0.5,
      },
    ],
  },
  {
    label: 'Luma',
    models: [
      {
        icon: LumaIcon,
        id: 'luma-ray-1.6',
        label: 'Ray 1.6',
        model: 'ray-1-6',

        // https://lumalabs.ai/api/pricing
        // Luma pricing isn't well documented, "API Cost" refers to per frame.
        getCost: () => {
          const unitCost = 0.0032;
          const frames = 24;
          const width = 1920;
          const height = 1080;
          const seconds = 5;

          const pixels = width * height;
          const frameCost = (pixels / million) * unitCost;

          return frameCost * frames * seconds;
        },
      },
      {
        icon: LumaIcon,
        id: 'luma-ray-2',
        label: 'Ray 2',
        model: 'ray-2',

        // https://lumalabs.ai/api/pricing
        // Luma pricing isn't well documented, "API Cost" refers to per frame.
        getCost: () => {
          const unitCost = 0.0064;
          const frames = 24;
          const width = 1920;
          const height = 1080;
          const seconds = 5;

          const pixels = width * height;
          const frameCost = (pixels / million) * unitCost;

          return frameCost * frames * seconds;
        },
      },
      {
        icon: LumaIcon,
        id: 'luma-ray-flash-2',
        label: 'Ray Flash 2',
        model: 'ray-flash-2',

        // https://lumalabs.ai/api/pricing
        // Luma pricing isn't well documented, "API Cost" refers to per frame.
        getCost: () => {
          const unitCost = 0.0022;
          const frames = 24;
          const width = 1920;
          const height = 1080;
          const seconds = 5;

          const pixels = width * height;
          const frameCost = (pixels / million) * unitCost;

          return frameCost * frames * seconds;
        },
      },
    ],
  },
];
