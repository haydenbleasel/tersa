import { ReplicateIcon } from '@/lib/icons';
import {
  type TersaModel,
  type TersaProvider,
  providers,
} from '@/lib/providers';
import { luma } from './luma';
import { minimax } from './minimax';
import { replicate } from './replicate';
import { runway } from './runway';

const million = 1000000;

export type VideoModel = {
  modelId: string;
  generate: (props: {
    prompt: string;
    imagePrompt: string | undefined;
    duration: 5;
    aspectRatio: string;
  }) => Promise<string>;
};

export type TersaVideoModel = TersaModel & {
  providers: (TersaProvider & {
    model: VideoModel;
    getCost: ({ duration }: { duration: number }) => number;
  })[];
};

export const videoModels: Record<string, TersaVideoModel> = {
  'minimax-t2v-01-director': {
    label: 'T2V-01-Director',
    chef: providers.minimax,
    providers: [
      {
        ...providers.minimax,
        model: minimax('T2V-01-Director'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
    ],
  },
  'minimax-i2v-01-director': {
    label: 'I2V-01-Director',
    chef: providers.minimax,
    providers: [
      {
        ...providers.minimax,
        model: minimax('I2V-01-Director'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
    ],
  },
  'minimax-s2v-01': {
    label: 'S2V-01',
    chef: providers.minimax,
    providers: [
      {
        ...providers.minimax,
        model: minimax('S2V-01'),

        // https://www.minimax.io/price
        getCost: () => 0.65,
      },
    ],
  },
  'minimax-i2v-01': {
    label: 'I2V-01',
    chef: providers.minimax,
    providers: [
      {
        ...providers.minimax,
        model: minimax('I2V-01'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
    ],
  },
  'minimax-i2v-01-live': {
    label: 'I2V-01-live',
    chef: providers.minimax,
    providers: [
      {
        ...providers.minimax,
        model: minimax('I2V-01-live'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
    ],
  },
  'minimax-t2v-01': {
    label: 'T2V-01',
    chef: providers.minimax,
    providers: [
      {
        ...providers.minimax,
        model: minimax('T2V-01'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
    ],
  },
  'runway-gen4-turbo': {
    label: 'Gen4 Turbo',
    chef: providers.runway,
    providers: [
      {
        ...providers.runway,
        model: runway('gen4_turbo'),

        // https://docs.dev.runwayml.com/#price
        getCost: () => 0.5,
      },
    ],
    default: true,
  },
  'runway-gen3a-turbo': {
    label: 'Gen3a Turbo',
    chef: providers.runway,
    providers: [
      {
        ...providers.runway,
        model: runway('gen3a_turbo'),

        // https://docs.dev.runwayml.com/#price
        getCost: () => 0.5,
      },
    ],
  },
  'luma-ray-1.6': {
    label: 'Ray 1.6',
    chef: providers.luma,
    providers: [
      {
        ...providers.luma,
        model: luma('ray-1-6'),

        // https://lumalabs.ai/api/pricing
        // Luma pricing isn't well documented, "API Cost" refers to per frame.
        getCost: ({ duration }) => {
          const unitCost = 0.0032;
          const frames = 24;
          const width = 1920;
          const height = 1080;

          const pixels = width * height;
          const frameCost = (pixels / million) * unitCost;

          return frameCost * frames * duration;
        },
      },
    ],
  },
  'luma-ray-2': {
    label: 'Ray 2',
    chef: providers.luma,
    providers: [
      {
        ...providers.luma,
        model: luma('ray-2'),

        // https://lumalabs.ai/api/pricing
        // Luma pricing isn't well documented, "API Cost" refers to per frame.
        getCost: ({ duration }) => {
          const unitCost = 0.0064;
          const frames = 24;
          const width = 1920; // 1920x1080
          const height = 1080;

          const pixels = width * height;
          const frameCost = (pixels / million) * unitCost;

          return frameCost * frames * duration;
        },
      },
    ],
  },
  'luma-ray-flash-2': {
    label: 'Ray Flash 2',
    chef: providers.luma,
    providers: [
      {
        ...providers.luma,
        model: luma('ray-flash-2'),

        // https://lumalabs.ai/api/pricing
        // Luma pricing isn't well documented, "API Cost" refers to per frame.
        getCost: ({ duration }) => {
          const unitCost = 0.0022;
          const frames = 24;
          const width = 1920;
          const height = 1080;

          const pixels = width * height;
          const frameCost = (pixels / million) * unitCost;

          return frameCost * frames * duration;
        },
      },
    ],
  },
  'kling-v1.5-standard': {
    label: 'Kling v1.5 Standard',
    chef: providers.kling,
    providers: [
      {
        ...providers.replicate,
        model: replicate.kling('kwaivgi/kling-v1.5-standard'),
        icon: ReplicateIcon,

        // https://replicate.com/kwaivgi/kling-v1.5-standard
        getCost: ({ duration }) => {
          const unitCost = 0.05;

          return unitCost * duration;
        },
      },
    ],
  },
  'kling-v1.5-pro': {
    label: 'Kling v1.5 Pro',
    chef: providers.kling,
    providers: [
      {
        ...providers.replicate,
        icon: ReplicateIcon,
        model: replicate.kling('kwaivgi/kling-v1.5-pro'),

        // https://replicate.com/kwaivgi/kling-v1.5-pro
        getCost: ({ duration }) => {
          const unitCost = 0.095;

          return unitCost * duration;
        },
      },
    ],
  },
  'kling-v1.6-standard': {
    label: 'Kling v1.6 Standard',
    chef: providers.kling,
    providers: [
      {
        ...providers.replicate,
        icon: ReplicateIcon,
        model: replicate.kling('kwaivgi/kling-v1.6-standard'),

        // https://replicate.com/kwaivgi/kling-v1.6-standard
        getCost: ({ duration }) => {
          const unitCost = 0.05;

          return unitCost * duration;
        },
      },
    ],
  },
  'kling-v1.6-pro': {
    label: 'Kling v1.6 Pro',
    chef: providers.kling,
    providers: [
      {
        ...providers.replicate,
        icon: ReplicateIcon,
        model: replicate.kling('kwaivgi/kling-v1.6-pro'),

        // https://replicate.com/kwaivgi/kling-v1.6-pro
        getCost: ({ duration }) => {
          const unitCost = 0.095;

          return unitCost * duration;
        },
      },
    ],
  },
  'kling-v2.0': {
    label: 'Kling v2.0',
    chef: providers.kling,
    providers: [
      {
        ...providers.replicate,
        icon: ReplicateIcon,
        model: replicate.kling('kwaivgi/kling-v2.0'),

        // https://replicate.com/kwaivgi/kling-v2.0
        getCost: ({ duration }) => {
          const unitCost = 0.28;

          return unitCost * duration;
        },
      },
    ],
  },
};
