import { openai } from '@ai-sdk/openai';
import type { TranscriptionModel } from 'ai';
import type { OpenAiIcon } from '../icons';
import { type TersaProvider, providers } from '../providers';

type TersaTranscriptionModel = {
  // Inherits from chef if not provided
  icon?: typeof OpenAiIcon;
  label: string;
  chef: TersaProvider;
  providers: (TersaProvider & {
    model: TranscriptionModel;
  })[];
  default?: boolean;
};

export const transcriptionModels: Record<string, TersaTranscriptionModel> = {
  'gpt-4o-mini-transcribe': {
    label: 'GPT-4o Mini Transcribe',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.transcription('gpt-4o-mini-transcribe'),
      },
    ],
    default: true,
  },
  'whisper-1': {
    label: 'Whisper 1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.transcription('whisper-1'),
      },
    ],
  },
  'gpt-4o-transcribe': {
    label: 'GPT-4o Transcribe',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.transcription('gpt-4o-transcribe'),
      },
    ],
  },
};
