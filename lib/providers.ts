import {
  AlibabaCloudIcon,
  AmazonBedrockIcon,
  AmazonIcon,
  AnthropicIcon,
  BlackForestLabsIcon,
  CerebrasIcon,
  CohereIcon,
  DeepSeekIcon,
  DeepinfraIcon,
  FalIcon,
  FireworksIcon,
  GoogleIcon,
  GroqIcon,
  HumeIcon,
  KlingIcon,
  LmntIcon,
  LumaIcon,
  MetaIcon,
  MinimaxIcon,
  MistralIcon,
  OpenAiIcon,
  ReplicateIcon,
  RunwayIcon,
  TogetherIcon,
  VercelIcon,
  XaiIcon,
} from './icons';

export type TersaProvider = {
  name: string;
  icon: typeof OpenAiIcon;
};

export const providers: Record<string, TersaProvider> = {
  openai: {
    name: 'OpenAI',
    icon: OpenAiIcon,
  },
  anthropic: {
    name: 'Anthropic',
    icon: AnthropicIcon,
  },
  google: {
    name: 'Google',
    icon: GoogleIcon,
  },
  meta: {
    name: 'Meta',
    icon: MetaIcon,
  },
  xai: {
    name: 'xAI',
    icon: XaiIcon,
  },
  vercel: {
    name: 'Vercel',
    icon: VercelIcon,
  },
  groq: {
    name: 'Groq',
    icon: GroqIcon,
  },
  mistral: {
    name: 'Mistral',
    icon: MistralIcon,
  },
  luma: {
    name: 'Luma',
    icon: LumaIcon,
  },
  minimax: {
    name: 'Minimax',
    icon: MinimaxIcon,
  },
  hume: {
    name: 'Hume',
    icon: HumeIcon,
  },
  cohere: {
    name: 'Cohere',
    icon: CohereIcon,
  },
  lmnt: {
    name: 'LMNT',
    icon: LmntIcon,
  },
  'black-forest-labs': {
    name: 'Black Forest Labs',
    icon: BlackForestLabsIcon,
  },
  deepseek: {
    name: 'DeepSeek',
    icon: DeepSeekIcon,
  },
  runway: {
    name: 'Runway',
    icon: RunwayIcon,
  },
  together: {
    name: 'Together',
    icon: TogetherIcon,
  },
  'alibaba-cloud': {
    name: 'Alibaba Cloud',
    icon: AlibabaCloudIcon,
  },
  'amazon-bedrock': {
    name: 'Amazon Bedrock',
    icon: AmazonBedrockIcon,
  },
  amazon: {
    name: 'Amazon',
    icon: AmazonIcon,
  },
  cerebras: {
    name: 'Cerebras',
    icon: CerebrasIcon,
  },
  deepinfra: {
    name: 'Deepinfra',
    icon: DeepinfraIcon,
  },
  fal: {
    name: 'Fal',
    icon: FalIcon,
  },
  fireworks: {
    name: 'Fireworks',
    icon: FireworksIcon,
  },
  kling: {
    name: 'Kling',
    icon: KlingIcon,
  },
  replicate: {
    name: 'Replicate',
    icon: ReplicateIcon,
  },
};
