import { hume } from '@ai-sdk/hume';
import { lmnt } from '@ai-sdk/lmnt';
import { openai } from '@ai-sdk/openai';
import type { SpeechModel } from 'ai';
import { type TersaModel, type TersaProvider, providers } from '../providers';

const million = 1000000;
const thousand = 1000;

type TersaSpeechModel = TersaModel & {
  providers: (TersaProvider & {
    model: SpeechModel;
    getCost: (characters: number) => number;
  })[];
  voices: string[];
};

export const speechModels: Record<string, TersaSpeechModel> = {
  'tts-1': {
    label: 'TTS-1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.speech('tts-1'),
        getCost: (characters: number) => (characters / million) * 15,
      },
    ],
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
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.speech('tts-1-hd'),
        getCost: (characters: number) => (characters / million) * 30,
      },
    ],
    default: true,
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
  aurora: {
    label: 'Aurora',
    chef: providers.lmnt,
    providers: [
      {
        ...providers.lmnt,
        model: lmnt.speech('aurora'),
        getCost: (characters: number) => (characters / thousand) * 0.05,
      },
    ],
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
    chef: providers.lmnt,
    providers: [
      {
        ...providers.lmnt,
        model: lmnt.speech('blizzard'),
        getCost: (characters: number) => (characters / thousand) * 0.05,
      },
    ],
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
  hume: {
    label: 'Hume',
    chef: providers.hume,
    providers: [
      {
        ...providers.hume,
        model: hume.speech(),

        // Creator plan pricing
        getCost: (characters: number) => (characters / thousand) * 0.2,
      },
    ],
    voices: [],
  },
};
