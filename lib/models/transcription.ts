import { openai } from '@ai-sdk/openai';
import type { TranscriptionModel } from 'ai';
import { OpenAiIcon } from '../icons';

type TersaTranscriptionModel = {
  // Inherits from chef if not provided
  icon?: typeof OpenAiIcon;
  label: string;
  providers: {
    // Inherits from chef if not provided
    icon?: typeof OpenAiIcon;
    name: string;
    model: TranscriptionModel;
  }[];
  default?: boolean;
};

export const transcriptionModels: {
  icon: typeof OpenAiIcon;
  label: string;
  models: Record<string, TersaTranscriptionModel>;
}[] = [
  {
    label: 'OpenAI',
    icon: OpenAiIcon,
    models: {
      'gpt-4o-mini-transcribe': {
        label: 'GPT-4o Mini Transcribe',
        providers: [
          {
            name: 'OpenAI',
            model: openai.transcription('gpt-4o-mini-transcribe'),
          },
        ],
        default: true,
      },
      'whisper-1': {
        label: 'Whisper 1',
        providers: [
          {
            name: 'OpenAI',
            model: openai.transcription('whisper-1'),
          },
        ],
      },
      'gpt-4o-transcribe': {
        label: 'GPT-4o Transcribe',
        providers: [
          {
            name: 'OpenAI',
            model: openai.transcription('gpt-4o-transcribe'),
          },
        ],
      },
    },
  },
];
