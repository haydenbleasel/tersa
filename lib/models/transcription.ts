import { openai } from '@ai-sdk/openai';
import { OpenAiIcon } from '../icons';

export const transcriptionModels = [
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4o-mini-transcribe',
        label: 'GPT-4o Mini Transcribe',
        model: openai.transcription('gpt-4o-mini-transcribe'),
        default: true,
      },
      {
        icon: OpenAiIcon,
        id: 'openai-whisper-1',
        label: 'Whisper 1',
        model: openai.transcription('whisper-1'),
      },
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-4o-transcribe',
        label: 'GPT-4o Transcribe',
        model: openai.transcription('gpt-4o-transcribe'),
      },
    ],
  },
];
