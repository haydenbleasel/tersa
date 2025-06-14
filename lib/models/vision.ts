import { openai } from '@ai-sdk/openai';
import type { LanguageModelV1 } from 'ai';
import { type TersaModel, type TersaProvider, providers } from '../providers';

type TersaVisionModel = TersaModel & {
  providers: (TersaProvider & {
    model: LanguageModelV1;
  })[];
};

export const visionModels: Record<string, TersaVisionModel> = {
  'openai-gpt-4.1': {
    label: 'GPT-4.1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4.1'),
      },
    ],
  },
  'openai-gpt-4.1-mini': {
    label: 'GPT-4.1 Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4.1-mini'),
      },
    ],
  },
  'openai-gpt-4.1-nano': {
    label: 'GPT-4.1 Nano',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4.1-nano'),
      },
    ],
    default: true,
  },
  'openai-o3': {
    label: 'O3',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o3'),
      },
    ],
  },
  'openai-o4-mini': {
    label: 'O4 Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o4-mini'),
      },
    ],
  },
  'openai-o1': {
    label: 'O1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o1'),
      },
    ],
  },
  'openai-o1-pro': {
    label: 'O1 Pro',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('o1-pro'),
      },
    ],
  },
  'openai-gpt-4o': {
    label: 'GPT-4o',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4o'),
      },
    ],
  },
  'openai-gpt-4o-2024-05-13': {
    label: 'GPT-4o (2024-05-13)',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4o-2024-05-13'),
      },
    ],
  },
  'openai-gpt-4o-mini': {
    label: 'GPT-4o Mini',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4o-mini'),
      },
    ],
  },
  'openai-computer-use-preview': {
    label: 'Computer Use Preview',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('computer-use-preview'),
      },
    ],
  },
  'openai-gpt-4.5-preview': {
    label: 'GPT-4.5 Preview',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-4.5-preview'),
      },
    ],
  },
  'openai-gpt-image-1': {
    label: 'GPT Image 1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai('gpt-image-1'),
      },
    ],
  },
};
