import { type TersaProvider, providers } from '@/lib/providers';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import type { ImageModel } from 'ai';
import { AmazonBedrockIcon, GrokIcon, type OpenAiIcon } from '../../icons';
import { blackForestLabs } from './black-forest-labs';

const million = 1000000;

export type ImageSize = `${number}x${number}`;

type TersaImageModel = {
  // Inherits from chef if not provided
  icon?: typeof OpenAiIcon;
  label: string;
  chef: TersaProvider;
  providers: (TersaProvider & {
    model: ImageModel;
  })[];
  sizes?: ImageSize[];
  getCost: (props?: {
    textInput?: number;
    imageInput?: number;
    output?: number;
    size?: string;
  }) => number;
  supportsEdit?: boolean;
  disabled?: boolean;
  providerOptions?: Record<string, Record<string, string>>;
  priceIndicator?: 'lowest' | 'low' | 'high' | 'highest';
  default?: boolean;
};

export const imageModels: Record<string, TersaImageModel> = {
  'grok-2-image': {
    icon: GrokIcon,
    label: 'Grok',
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai.image('grok-2-image'),
      },
    ],

    // xAI does not support size or quality
    // size: '1024x1024',
    // providerOptions: {},

    // https://docs.x.ai/docs/models#models-and-pricing
    getCost: () => 0.07,
  },
  'dall-e-3': {
    label: 'DALL-E 3',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.image('dall-e-3'),
      },
    ],
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    providerOptions: {
      openai: {
        quality: 'hd',
      },
    },

    // https://platform.openai.com/docs/pricing#image-generation
    getCost: (props) => {
      if (!props) {
        throw new Error('Props are required');
      }

      if (!props.size) {
        throw new Error('Size is required');
      }

      if (props.size === '1024x1024') {
        return 0.08;
      }

      if (props.size === '1024x1792' || props.size === '1792x1024') {
        return 0.12;
      }

      throw new Error('Size is not supported');
    },
  },
  'dall-e-2': {
    label: 'DALL-E 2',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.image('dall-e-2'),
      },
    ],
    sizes: ['1024x1024', '512x512', '256x256'],
    priceIndicator: 'low',
    providerOptions: {
      openai: {
        quality: 'standard',
      },
    },

    // https://platform.openai.com/docs/pricing#image-generation
    getCost: (props) => {
      if (!props) {
        throw new Error('Props are required');
      }

      const { size } = props;

      if (size === '1024x1024') {
        return 0.02;
      }

      if (size === '512x512') {
        return 0.018;
      }

      if (size === '256x256') {
        return 0.016;
      }

      throw new Error('Size is not supported');
    },
  },
  'gpt-image-1': {
    label: 'GPT Image 1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.image('gpt-image-1'),
      },
    ],
    supportsEdit: true,
    sizes: ['1024x1024', '1024x1536', '1536x1024'],
    default: true,
    providerOptions: {
      openai: {
        quality: 'high',
      },
    },

    // Input (Text): https://platform.openai.com/docs/pricing#latest-models
    // Input (Image): https://platform.openai.com/docs/pricing#text-generation
    // Output: https://platform.openai.com/docs/pricing#image-generation
    getCost: (props) => {
      const priceMap: Record<ImageSize, number> = {
        '1024x1024': 0.167,
        '1024x1536': 0.25,
        '1536x1024': 0.25,
      };

      if (!props) {
        throw new Error('Props are required');
      }

      if (typeof props.size !== 'string') {
        throw new Error('Size is required');
      }

      if (typeof props.output !== 'number') {
        throw new Error('Output is required');
      }

      if (typeof props.textInput !== 'number') {
        throw new Error('Text input is required');
      }

      if (typeof props.imageInput !== 'number') {
        throw new Error('Image input is required');
      }

      const { textInput, imageInput, output, size } = props;
      const textInputCost = textInput ? (textInput / million) * 5 : 0;
      const imageInputCost = imageInput ? (imageInput / million) * 10 : 0;
      const outputCost = (output / million) * priceMap[size as ImageSize];

      return textInputCost + imageInputCost + outputCost;
    },
  },
  'amazon-nova-canvas-v1': {
    label: 'Nova Canvas',
    chef: providers['amazon-bedrock'],
    providers: [
      {
        ...providers['amazon-bedrock'],
        icon: AmazonBedrockIcon,
        model: bedrock.image('amazon.nova-canvas-v1:0'),
      },
    ],

    // Each side must be between 320-4096 pixels, inclusive.
    sizes: ['1024x1024', '2048x2048'],

    providerOptions: {
      bedrock: {
        quality: 'premium',
      },
    },

    // https://aws.amazon.com/bedrock/pricing/
    getCost: (props) => {
      if (!props) {
        throw new Error('Props are required');
      }

      const { size } = props;

      if (size === '1024x1024') {
        return 0.06;
      }

      if (size === '2048x2048') {
        return 0.08;
      }

      throw new Error('Size is not supported');
    },
  },
  'flux-pro-1.1': {
    label: 'FLUX Pro 1.1',
    chef: providers['black-forest-labs'],
    providers: [
      {
        ...providers['black-forest-labs'],
        model: blackForestLabs.image('flux-pro-1.1'),
      },
    ],
    sizes: ['1024x1024', '832x1440', '1440x832'],
    supportsEdit: true,

    // https://bfl.ai/pricing/api
    getCost: () => 0.04,
  },
  'flux-pro': {
    label: 'FLUX Pro',
    chef: providers['black-forest-labs'],
    providers: [
      {
        ...providers['black-forest-labs'],
        model: blackForestLabs.image('flux-pro'),
      },
    ],
    sizes: ['1024x1024', '832x1440', '1440x832'],
    supportsEdit: true,

    // https://bfl.ai/pricing/api
    getCost: () => 0.05,
  },
  'flux-dev': {
    label: 'FLUX Dev',
    chef: providers['black-forest-labs'],
    providers: [
      {
        ...providers['black-forest-labs'],
        model: blackForestLabs.image('flux-dev'),
      },
    ],
    sizes: ['1024x1024', '832x1440', '1440x832'],
    supportsEdit: true,
    priceIndicator: 'low',

    // https://bfl.ai/pricing/api
    getCost: () => 0.025,
  },
  'flux-pro-1.0-canny': {
    label: 'FLUX Pro 1.0 Canny',
    chef: providers['black-forest-labs'],
    providers: [
      {
        ...providers['black-forest-labs'],
        model: blackForestLabs.image('flux-pro-1.0-canny'),
      },
    ],
    sizes: ['1024x1024', '832x1440', '1440x832'],
    supportsEdit: true,

    // https://bfl.ai/pricing/api
    getCost: () => 0.05,
  },
  'flux-pro-1.0-depth': {
    label: 'FLUX Pro 1.0 Depth',
    chef: providers['black-forest-labs'],
    providers: [
      {
        ...providers['black-forest-labs'],
        model: blackForestLabs.image('flux-pro-1.0-depth'),
      },
    ],
    sizes: ['1024x1024', '832x1440', '1440x832'],
    supportsEdit: true,

    // https://bfl.ai/pricing/api
    getCost: () => 0.05,
  },
  'flux-kontext-pro': {
    label: 'FLUX Kontext Pro',
    chef: providers['black-forest-labs'],
    providers: [
      {
        ...providers['black-forest-labs'],
        model: blackForestLabs.image('flux-kontext-pro'),
      },
    ],
    sizes: ['1024x1024', '832x1440', '1440x832'],
    supportsEdit: true,

    // https://bfl.ai/pricing/api
    getCost: () => 0.04,
  },
  'flux-kontext-max': {
    label: 'FLUX Kontext Max',
    chef: providers['black-forest-labs'],
    providers: [
      {
        ...providers['black-forest-labs'],
        model: blackForestLabs.image('flux-kontext-max'),
      },
    ],
    sizes: ['1024x1024', '832x1440', '1440x832'],
    supportsEdit: true,

    // https://bfl.ai/pricing/api
    getCost: () => 0.08,
  },
};
