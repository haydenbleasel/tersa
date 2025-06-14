import { openai } from '@ai-sdk/openai';
import type { TranscriptionModel } from 'ai';
import { type TersaModel, type TersaProvider, providers } from '../providers';

type TersaTranscriptionModel = TersaModel & {
  providers: (TersaProvider & {
    model: TranscriptionModel;
  })[];
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
