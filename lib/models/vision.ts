import { openai } from '@ai-sdk/openai';
import { OpenAiIcon } from '../icons';

export const visionModels = [
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4.1',
        label: 'GPT-4.1',
        model: openai('gpt-4.1'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4.1-mini',
        label: 'GPT-4.1 Mini',
        model: openai('gpt-4.1-mini'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4.1-nano',
        label: 'GPT-4.1 Nano',
        model: openai('gpt-4.1-nano'),
        default: true,
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o3',
        label: 'O3',
        model: openai('o3'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o4-mini',
        label: 'O4 Mini',
        model: openai('o4-mini'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o1',
        label: 'O1',
        model: openai('o1'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-o1-pro',
        label: 'O1 Pro',
        model: openai('o1-pro'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4o',
        label: 'GPT-4o',
        model: openai('gpt-4o'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4o-2024-05-13',
        label: 'GPT-4o (2024-05-13)',
        model: openai('gpt-4o-2024-05-13'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4o-mini',
        label: 'GPT-4o Mini',
        model: openai('gpt-4o-mini'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-computer-use-preview',
        label: 'Computer Use Preview',
        model: openai('computer-use-preview'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4.5-preview',
        label: 'GPT-4.5 Preview',
        model: openai('gpt-4.5-preview'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-image-1',
        label: 'GPT Image 1',
        model: openai('gpt-image-1'),
      },
    ],
  },
];
