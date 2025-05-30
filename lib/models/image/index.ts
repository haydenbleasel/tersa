import { bedrock } from '@ai-sdk/amazon-bedrock';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import type { ImageModel } from 'ai';
import {
  AmazonIcon,
  BlackForestLabsIcon,
  OpenAiIcon,
  XaiIcon,
} from '../../icons';
import { blackForestLabs } from './black-forest-labs';

const million = 1000000;

export type ImageSize = `${number}x${number}`;

export const imageModels: {
  label: string;
  models: {
    icon: typeof XaiIcon;
    id: string;
    label: string;
    model: ImageModel;
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
  }[];
}[] = [
  {
    label: 'xAI',
    models: [
      {
        icon: XaiIcon,
        id: 'xai-grok-2-image',
        label: 'Grok',
        model: xai.image('grok-2-image'),

        // xAI does not support size or quality
        // size: '1024x1024',
        // providerOptions: {},

        // https://docs.x.ai/docs/models#models-and-pricing
        getCost: () => 0.07,
      },
    ],
  },
  {
    label: 'OpenAI',
    models: [
      {
        icon: OpenAiIcon,
        id: 'openai-dall-e-3',
        label: 'DALL-E 3',
        model: openai.image('dall-e-3'),
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
      {
        icon: OpenAiIcon,
        id: 'openai-dall-e-2',
        label: 'DALL-E 2',
        model: openai.image('dall-e-2'),
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
      {
        icon: OpenAiIcon,
        id: 'openai-gpt-image-1',
        label: 'GPT Image 1',
        model: openai.image('gpt-image-1'),
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
    ],
  },
  {
    label: 'Amazon Bedrock',
    models: [
      {
        icon: AmazonIcon,
        id: 'amazon-nova-canvas-v1',
        label: 'Nova Canvas',
        model: bedrock.image('amazon.nova-canvas-v1:0'),

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
    ],
  },
  {
    label: 'Black Forest Labs',
    models: [
      {
        icon: BlackForestLabsIcon,
        id: 'black-forest-labs/flux-pro-1.1',
        label: 'FLUX Pro 1.1',
        model: blackForestLabs.image('flux-pro-1.1'),
        sizes: ['1024x1024', '822x1440', '1440x822'],
        supportsEdit: true,

        // https://bfl.ai/pricing/api
        getCost: () => 0.04,
      },
      {
        icon: BlackForestLabsIcon,
        id: 'black-forest-labs/flux-pro',
        label: 'FLUX Pro',
        model: blackForestLabs.image('flux-pro'),
        sizes: ['1024x1024', '822x1440', '1440x822'],
        supportsEdit: true,

        // https://bfl.ai/pricing/api
        getCost: () => 0.05,
      },
      {
        icon: BlackForestLabsIcon,
        id: 'black-forest-labs/flux-dev',
        label: 'FLUX Dev',
        model: blackForestLabs.image('flux-dev'),
        sizes: ['1024x1024', '822x1440', '1440x822'],
        supportsEdit: true,
        priceIndicator: 'low',

        // https://bfl.ai/pricing/api
        getCost: () => 0.025,
      },
      {
        icon: BlackForestLabsIcon,
        id: 'black-forest-labs/flux-pro-1.0-canny',
        label: 'FLUX Pro 1.0 Canny',
        model: blackForestLabs.image('flux-pro-1.0-canny'),
        sizes: ['1024x1024', '822x1440', '1440x822'],
        supportsEdit: true,

        // https://bfl.ai/pricing/api
        getCost: () => 0.05,
      },
      {
        icon: BlackForestLabsIcon,
        id: 'black-forest-labs/flux-pro-1.0-depth',
        label: 'FLUX Pro 1.0 Depth',
        model: blackForestLabs.image('flux-pro-1.0-depth'),
        sizes: ['1024x1024', '822x1440', '1440x822'],
        supportsEdit: true,

        // https://bfl.ai/pricing/api
        getCost: () => 0.05,
      },
      {
        icon: BlackForestLabsIcon,
        id: 'black-forest-labs/flux-kontext-pro',
        label: 'FLUX Kontext Pro',
        model: blackForestLabs.image('flux-kontext-pro'),
        sizes: ['1024x1024', '822x1440', '1440x822'],
        supportsEdit: true,

        // https://bfl.ai/pricing/api
        getCost: () => 0.04,
      },
      {
        icon: BlackForestLabsIcon,
        id: 'black-forest-labs/flux-kontext-max',
        label: 'FLUX Kontext Max',
        model: blackForestLabs.image('flux-kontext-max'),
        sizes: ['1024x1024', '822x1440', '1440x822'],
        supportsEdit: true,

        // https://bfl.ai/pricing/api
        getCost: () => 0.08,
      },
    ],
  },
  // {
  //   label: 'Fal',
  //   models: [
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/flux/dev',
  //       label: 'Flux Dev',
  //       model: fal.image('fal-ai/flux/dev'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/flux-lora',
  //       label: 'Flux Lora',
  //       model: fal.image('fal-ai/flux-lora'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/fast-sdxl',
  //       label: 'Fast SDXL',
  //       model: fal.image('fal-ai/fast-sdxl'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/flux-pro/v1.1-ultra',
  //       label: 'Flux Pro Ultra',
  //       model: fal.image('fal-ai/flux-pro/v1.1-ultra'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/ideogram/v2',
  //       label: 'Ideogram v2',
  //       model: fal.image('fal-ai/ideogram/v2'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/recraft-v3',
  //       label: 'Recraft v3',
  //       model: fal.image('fal-ai/recraft-v3'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/stable-diffusion-3.5-large',
  //       label: 'SD 3.5 Large',
  //       model: fal.image('fal-ai/stable-diffusion-3.5-large'),
  //     },
  //     {
  //       icon: FalIcon,
  //       id: 'fal-ai/hyper-sdxl',
  //       label: 'Hyper SDXL',
  //       model: fal.image('fal-ai/hyper-sdxl'),
  //     },
  //   ],
  // },
  // {
  //   label: 'DeepInfra',
  //   models: [
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'stabilityai/sd3.5',
  //       label: 'SD 3.5',
  //       model: deepinfra.image('stabilityai/sd3.5'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-1.1-pro',
  //       label: 'FLUX 1.1 Pro',
  //       model: deepinfra.image('black-forest-labs/FLUX-1.1-pro'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-1-schnell',
  //       label: 'FLUX 1 Schnell',
  //       model: deepinfra.image('black-forest-labs/FLUX-1-schnell'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-1-dev',
  //       label: 'FLUX 1 Dev',
  //       model: deepinfra.image('black-forest-labs/FLUX-1-dev'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'black-forest-labs/FLUX-pro',
  //       label: 'FLUX Pro',
  //       model: deepinfra.image('black-forest-labs/FLUX-pro'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'stabilityai/sd3.5-medium',
  //       label: 'SD 3.5 Medium',
  //       model: deepinfra.image('stabilityai/sd3.5-medium'),
  //     },
  //     {
  //       icon: DeepinfraIcon,
  //       id: 'stabilityai/sdxl-turbo',
  //       label: 'SDXL Turbo',
  //       model: deepinfra.image('stabilityai/sdxl-turbo'),
  //     },
  //   ],
  // },
  // {
  //   label: 'Replicate',
  //   models: [
  //     {
  //       icon: ReplicateIcon,
  //       id: 'black-forest-labs/flux-schnell',
  //       label: 'Flux Schnell',
  //       model: replicate.image('black-forest-labs/flux-schnell'),
  //     },
  //     {
  //       icon: ReplicateIcon,
  //       id: 'recraft-ai/recraft-v3',
  //       label: 'Recraft v3',
  //       model: replicate.image('recraft-ai/recraft-v3'),
  //     },
  //   ],
  // },
  // {
  //   label: 'Google Vertex',
  //   models: [
  //     {
  //       icon: GoogleIcon,
  //       id: 'imagen-3.0-generate-001',
  //       label: 'Imagen 3.0',
  //       model: googlevertex.image('imagen-3.0-generate-001'),
  //     },
  //     {
  //       icon: GoogleIcon,
  //       id: 'imagen-3.0-fast-generate-001',
  //       label: 'Imagen 3.0 Fast',
  //       model: googlevertex.image('imagen-3.0-fast-generate-001'),
  //     },
  //   ],
  // },
  // {
  //   label: 'Fireworks',
  //   models: [
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/flux-1-dev-fp8',
  //       label: 'Flux 1 Dev FP8',
  //       model: fireworks.image('accounts/fireworks/models/flux-1-dev-fp8'),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/flux-1-schnell-fp8',
  //       label: 'Flux 1 Schnell FP8',
  //       model: fireworks.image('accounts/fireworks/models/flux-1-schnell-fp8'),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/playground-v2-5-1024px-aesthetic',
  //       label: 'Playground v2.5',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/playground-v2-5-1024px-aesthetic'
  //       ),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/japanese-stable-diffusion-xl',
  //       label: 'Japanese SDXL',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/japanese-stable-diffusion-xl'
  //       ),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/playground-v2-1024px-aesthetic',
  //       label: 'Playground v2',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/playground-v2-1024px-aesthetic'
  //       ),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/SSD-1B',
  //       label: 'SSD-1B',
  //       model: fireworks.image('accounts/fireworks/models/SSD-1B'),
  //     },
  //     {
  //       icon: FireworksIcon,
  //       id: 'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0',
  //       label: 'SDXL 1.0',
  //       model: fireworks.image(
  //         'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0'
  //       ),
  //     },
  //   ],
  // },
  // {
  //   label: 'Luma',
  //   models: [
  //     {
  //       icon: LumaIcon,
  //       id: 'photon-1',
  //       label: 'Photon 1',
  //       model: luma.image('photon-1'),

  //       getCost: (width: number, height: number) => {
  //         const pixels = width * height;

  //         return (pixels / million) * 0.0073;
  //       },
  //     },
  //     {
  //       icon: LumaIcon,
  //       id: 'photon-flash-1',
  //       label: 'Photon Flash 1',
  //       model: luma.image('photon-flash-1'),

  //       getCost: (width: number, height: number) => {
  //         const pixels = width * height;

  //         return (pixels / million) * 0.0019;
  //       },
  //     },
  //   ],
  // },
  // {
  //   label: 'Together.ai',
  //   models: [
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-dev',
  //       label: 'FLUX.1 Dev',
  //       model: togetherai.image('black-forest-labs/FLUX.1-dev'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.025;

  //         // Outcome: ~0.026
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-dev-lora',
  //       label: 'FLUX.1 Dev Lora',
  //       model: togetherai.image('black-forest-labs/FLUX.1-dev-lora'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.035;

  //         // Outcome: ~0.036
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-schnell',
  //       label: 'FLUX.1 Schnell',
  //       model: togetherai.image('black-forest-labs/FLUX.1-schnell'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.0027;

  //         // Outcome: ~0.0028
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-canny',
  //       label: 'FLUX.1 Canny',
  //       model: togetherai.image('black-forest-labs/FLUX.1-canny'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.025;

  //         // Outcome: ~0.026
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-depth',
  //       label: 'FLUX.1 Depth',
  //       model: togetherai.image('black-forest-labs/FLUX.1-depth'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.025;

  //         // Outcome: ~0.026
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-redux',
  //       label: 'FLUX.1 Redux',
  //       model: togetherai.image('black-forest-labs/FLUX.1-redux'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.025;

  //         // Outcome: ~0.026
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1.1-pro',
  //       label: 'FLUX.1.1 Pro',
  //       model: togetherai.image('black-forest-labs/FLUX.1.1-pro'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.04;

  //         // Outcome: ~0.04
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-pro',
  //       label: 'FLUX.1 Pro',
  //       model: togetherai.image('black-forest-labs/FLUX.1-pro'),
  //       size: '1024x1024',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0.05;

  //         // Outcome: ~0.05
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //     {
  //       icon: TogetherIcon,
  //       id: 'together-black-forest-labs/FLUX.1-schnell-Free',
  //       label: 'FLUX.1 Schnell Free',
  //       model: togetherai.image('black-forest-labs/FLUX.1-schnell-Free'),
  //       size: '1024x1024',
  //       priceIndicator: 'lowest',

  //       // https://www.together.ai/pricing
  //       getCost: (props) => {
  //         if (!props) {
  //           throw new Error('Props are required');
  //         }

  //         const width = 1024;
  //         const height = 1024;
  //         const pixels = width * height;
  //         const megapixels = pixels / million;
  //         const pricePerMegapixel = 0;

  //         // Outcome: 0
  //         return megapixels * pricePerMegapixel;
  //       },
  //     },
  //   ],
  // },
];
