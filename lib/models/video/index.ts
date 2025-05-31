import { ReplicateIcon } from '@/lib/icons';
import { LumaIcon, MinimaxIcon, RunwayIcon } from '@/lib/icons';
import { luma } from './luma';
import { minimax } from './minimax';
import { replicate } from './replicate';
import { runway } from './runway';

const million = 1000000;

export type VideoModel = {
  icon: typeof MinimaxIcon;
  id: string;
  label: string;
  model: {
    modelId: string;
    generate: (props: {
      prompt: string;
      imagePrompt: string | undefined;
      duration: 5;
      aspectRatio: string;
    }) => Promise<string>;
  };
  getCost: ({ duration }: { duration: number }) => number;
  default?: boolean;
};

export type VideoProvider = {
  label: string;
  models: VideoModel[];
};

export const videoModels: VideoProvider[] = [
  {
    label: 'Minimax',
    models: [
      {
        icon: MinimaxIcon,
        id: 'minimax-t2v-01-director',
        label: 'T2V-01-Director',
        model: minimax('T2V-01-Director'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-i2v-01-director',
        label: 'I2V-01-Director',
        model: minimax('I2V-01-Director'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-s2v-01',
        label: 'S2V-01',
        model: minimax('S2V-01'),

        // https://www.minimax.io/price
        getCost: () => 0.65,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-i2v-01',
        label: 'I2V-01',
        model: minimax('I2V-01'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-i2v-01-live',
        label: 'I2V-01-live',
        model: minimax('I2V-01-live'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
      {
        icon: MinimaxIcon,
        id: 'minimax-t2v-01',
        label: 'T2V-01',
        model: minimax('T2V-01'),

        // https://www.minimax.io/price
        getCost: () => 0.43,
      },
    ],
  },
  {
    label: 'Runway',
    models: [
      {
        icon: RunwayIcon,
        id: 'runway-gen4-turbo',
        label: 'Gen4 Turbo',
        model: runway('gen4_turbo'),
        default: true,
        // https://docs.dev.runwayml.com/#price
        getCost: () => 0.5,
      },
      {
        icon: RunwayIcon,
        id: 'runway-gen3a-turbo',
        label: 'Gen3a Turbo',
        model: runway('gen3a_turbo'),

        // https://docs.dev.runwayml.com/#price
        getCost: () => 0.5,
      },
    ],
  },
  {
    label: 'Luma',
    models: [
      {
        icon: LumaIcon,
        id: 'luma-ray-1.6',
        label: 'Ray 1.6',
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
      {
        icon: LumaIcon,
        id: 'luma-ray-2',
        label: 'Ray 2',
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
      {
        icon: LumaIcon,
        id: 'luma-ray-flash-2',
        label: 'Ray Flash 2',
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
  {
    label: 'Replicate',
    models: [
      {
        icon: ReplicateIcon,
        id: 'replicate-kling-v1.6-standard',
        label: 'Kling 1.6 Standard',
        model: replicate.kling1p6standard,

        // https://replicate.com/kwaivgi/kling-v1.6-standard
        getCost: ({ duration }) => {
          const unitCost = 0.05;

          return unitCost * duration;
        },
      },
    ],
  },
];
