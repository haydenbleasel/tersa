import { openai } from '@ai-sdk/openai';
import type { LanguageModelV1 } from 'ai';
import { OpenAiIcon } from '../icons';

type TersaVisionModel = {
  // Inherits from chef if not provided
  icon?: typeof OpenAiIcon;
  label: string;
  providers: {
    // Inherits from chef if not provided
    icon?: typeof OpenAiIcon;
    name: string;
    model: LanguageModelV1;
  }[];
  default?: boolean;
};

export const visionModels: {
  icon: typeof OpenAiIcon;
  label: string;
  models: Record<string, TersaVisionModel>;
}[] = [
  {
    label: 'OpenAI',
    icon: OpenAiIcon,
    models: {
      'openai-gpt-4.1': {
        label: 'GPT-4.1',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4.1'),
          },
        ],
      },
      'openai-gpt-4.1-mini': {
        label: 'GPT-4.1 Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4.1-mini'),
          },
        ],
      },
      'openai-gpt-4.1-nano': {
        label: 'GPT-4.1 Nano',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4.1-nano'),
          },
        ],
        default: true,
      },
      'openai-o3': {
        label: 'O3',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o3'),
          },
        ],
      },
      'openai-o4-mini': {
        label: 'O4 Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o4-mini'),
          },
        ],
      },
      'openai-o1': {
        label: 'O1',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o1'),
          },
        ],
      },
      'openai-o1-pro': {
        label: 'O1 Pro',
        providers: [
          {
            name: 'OpenAI',
            model: openai('o1-pro'),
          },
        ],
      },
      'openai-gpt-4o': {
        label: 'GPT-4o',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4o'),
          },
        ],
      },
      'openai-gpt-4o-2024-05-13': {
        label: 'GPT-4o (2024-05-13)',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4o-2024-05-13'),
          },
        ],
      },
      'openai-gpt-4o-mini': {
        label: 'GPT-4o Mini',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4o-mini'),
          },
        ],
      },
      'openai-computer-use-preview': {
        label: 'Computer Use Preview',
        providers: [
          {
            name: 'OpenAI',
            model: openai('computer-use-preview'),
          },
        ],
      },
      'openai-gpt-4.5-preview': {
        label: 'GPT-4.5 Preview',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-4.5-preview'),
          },
        ],
      },
      'openai-gpt-image-1': {
        label: 'GPT Image 1',
        providers: [
          {
            name: 'OpenAI',
            model: openai('gpt-image-1'),
          },
        ],
      },
    },
  },
];
