import { hume } from '@ai-sdk/hume';
import { lmnt } from '@ai-sdk/lmnt';
import { openai } from '@ai-sdk/openai';
import type { SpeechModel } from 'ai';
import { HumeIcon, LmntIcon, OpenAiIcon } from '../icons';

const million = 1000000;
const thousand = 1000;

export const speechModels: {
  label: string;
  models: {
    icon: typeof OpenAiIcon;
    id: string;
    label: string;
    model: SpeechModel;
    voices: string[];
    getCost: (tokens: number) => number;
    default?: boolean;
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
        default: true,
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
