import type { PriceBracket } from '@/providers/gateway/client';
import {
  AlibabaCloudIcon,
  AmazonBedrockIcon,
  AmazonIcon,
  AnthropicIcon,
  AzureIcon,
  BasetenIcon,
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
  InceptionIcon,
  KlingIcon,
  LmntIcon,
  LumaIcon,
  MetaIcon,
  MinimaxIcon,
  MistralIcon,
  MoonshotAiIcon,
  MorphIcon,
  NovitaIcon,
  OpenAiIcon,
  PerplexityIcon,
  ReplicateIcon,
  RunwayIcon,
  TogetherIcon,
  UnknownIcon,
  VercelIcon,
  XaiIcon,
  ZaiIcon,
} from './icons';

export type TersaProvider = {
  id: string;
  name: string;
  icon: typeof OpenAiIcon;
};

export const providers = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: OpenAiIcon,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    icon: AnthropicIcon,
  },
  google: {
    id: 'google',
    name: 'Google',
    icon: GoogleIcon,
  },
  vertex: {
    id: 'vertex',
    name: 'Vertex',
    icon: GoogleIcon,
  },
  meta: {
    id: 'meta',
    name: 'Meta',
    icon: MetaIcon,
  },
  xai: {
    id: 'xai',
    name: 'xAI',
    icon: XaiIcon,
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    icon: VercelIcon,
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    icon: GroqIcon,
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    icon: MistralIcon,
  },
  luma: {
    id: 'luma',
    name: 'Luma',
    icon: LumaIcon,
  },
  minimax: {
    id: 'minimax',
    name: 'Minimax',
    icon: MinimaxIcon,
  },
  hume: {
    id: 'hume',
    name: 'Hume',
    icon: HumeIcon,
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    icon: CohereIcon,
  },
  lmnt: {
    id: 'lmnt',
    name: 'LMNT',
    icon: LmntIcon,
  },
  'black-forest-labs': {
    id: 'black-forest-labs',
    name: 'Black Forest Labs',
    icon: BlackForestLabsIcon,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: DeepSeekIcon,
  },
  runway: {
    id: 'runway',
    name: 'Runway',
    icon: RunwayIcon,
  },
  together: {
    id: 'together',
    name: 'Together',
    icon: TogetherIcon,
  },
  alibaba: {
    id: 'alibaba',
    name: 'Alibaba Cloud',
    icon: AlibabaCloudIcon,
  },
  bedrock: {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    icon: AmazonBedrockIcon,
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    icon: AmazonIcon,
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    icon: CerebrasIcon,
  },
  deepinfra: {
    id: 'deepinfra',
    name: 'Deepinfra',
    icon: DeepinfraIcon,
  },
  fal: {
    id: 'fal',
    name: 'Fal',
    icon: FalIcon,
  },
  fireworks: {
    id: 'fireworks',
    name: 'Fireworks',
    icon: FireworksIcon,
  },
  kling: {
    id: 'kling',
    name: 'Kling',
    icon: KlingIcon,
  },
  replicate: {
    id: 'replicate',
    name: 'Replicate',
    icon: ReplicateIcon,
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    icon: PerplexityIcon,
  },
  baseten: {
    id: 'baseten',
    name: 'Baseten',
    icon: BasetenIcon,
  },
  azure: {
    id: 'azure',
    name: 'Azure',
    icon: AzureIcon,
  },
  moonshotai: {
    id: 'moonshotai',
    name: 'Moonshot AI',
    icon: MoonshotAiIcon,
  },
  morph: {
    id: 'morph',
    name: 'Morph',
    icon: MorphIcon,
  },
  inception: {
    id: 'inception',
    name: 'Inception',
    icon: InceptionIcon,
  },
  zai: {
    id: 'zai',
    name: 'Zai',
    icon: ZaiIcon,
  },
  novita: {
    id: 'novita',
    name: 'Novita',
    icon: NovitaIcon,
  },
  unknown: {
    id: 'unknown',
    name: 'Other',
    icon: UnknownIcon,
  },
};

export type TersaModel = {
  // Inherits from chef if not provided
  icon?: typeof OpenAiIcon;
  label: string;
  chef: TersaProvider;
  providers: TersaProvider[];
  legacy?: boolean;
  priceIndicator?: PriceBracket;
  disabled?: boolean;
  default?: boolean;
};
