import { hume } from '@ai-sdk/hume';
import { lmnt } from '@ai-sdk/lmnt';
import { openai } from '@ai-sdk/openai';
import type { SpeechModel } from 'ai';
import { HumeIcon, LmntIcon, OpenAiIcon } from '../icons';

const million = 1000000;
const thousand = 1000;

type TersaSpeechModel = {
  // Inherits from chef if not provided
  icon?: typeof OpenAiIcon;
  label: string;
  providers: {
    // Inherits from chef if not provided
    icon?: typeof OpenAiIcon;
    name: string;
    model: SpeechModel;
  }[];
  getCost: (characters: number) => number;
  default?: boolean;
  voices: string[];
};

export const speechModels: {
  icon: typeof OpenAiIcon;
  label: string;
  models: Record<string, TersaSpeechModel>;
}[] = [
  {
    label: 'OpenAI',
    icon: OpenAiIcon,
    models: {
      'tts-1': {
        label: 'TTS-1',
        providers: [
          {
            name: 'OpenAI',
            model: openai.speech('tts-1'),
          },
        ],
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
      'tts-1-hd': {
        label: 'TTS-1-HD',
        providers: [
          {
            name: 'OpenAI',
            model: openai.speech('tts-1-hd'),
          },
        ],
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
    },
  },
  {
    label: 'LMNT',
    icon: LmntIcon,
    models: {
      aurora: {
        label: 'Aurora',
        providers: [
          {
            name: 'LMNT',
            model: lmnt.speech('aurora'),
          },
        ],
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
      blizzard: {
        label: 'Blizzard',
        providers: [
          {
            name: 'LMNT',
            model: lmnt.speech('blizzard'),
          },
        ],
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
    },
  },
  {
    label: 'Hume',
    icon: HumeIcon,
    models: {
      default: {
        label: 'Default',
        providers: [
          {
            name: 'Hume',
            model: hume.speech(),
          },
        ],
        // Creator plan pricing
        getCost: (characters: number) => (characters / thousand) * 0.2,
        voices: [],
      },
    },
  },
];
