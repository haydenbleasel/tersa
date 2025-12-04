import { bedrock } from "@ai-sdk/amazon-bedrock";
import { luma } from "@ai-sdk/luma";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import type { ImageModel } from "ai";
import {
  providers,
  type TersaModel,
  type TersaProvider,
} from "@/lib/providers";
import { AmazonBedrockIcon, GrokIcon } from "../../icons";
import { blackForestLabs } from "./black-forest-labs";

const million = 1_000_000;

export type ImageSize = `${number}x${number}`;

type TersaImageModel = TersaModel & {
  providers: (TersaProvider & {
    model: ImageModel;
    getCost: (props?: {
      textInput?: number;
      imageInput?: number;
      output?: number;
      size?: string;
    }) => number;
  })[];
  sizes?: ImageSize[];
  supportsEdit?: boolean;
  providerOptions?: Record<string, Record<string, string>>;
};

export const imageModels: Record<string, TersaImageModel> = {
  "grok-2-image": {
    icon: GrokIcon,
    label: "Grok 2 Image",
    chef: providers.xai,
    providers: [
      {
        ...providers.xai,
        model: xai.image("grok-2-image"),

        // https://docs.x.ai/docs/models#models-and-pricing
        getCost: () => 0.07,
      },
    ],

    // xAI does not support size or quality
    // size: '1024x1024',
    // providerOptions: {},
  },
  "dall-e-3": {
    label: "DALL-E 3",
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.image("dall-e-3"),

        // https://platform.openai.com/docs/pricing#image-generation
        getCost: (props) => {
          if (!props) {
            throw new Error("Props are required");
          }

          if (!props.size) {
            throw new Error("Size is required");
          }

          if (props.size === "1024x1024") {
            return 0.08;
          }

          if (props.size === "1024x1792" || props.size === "1792x1024") {
            return 0.12;
          }

          throw new Error("Size is not supported");
        },
      },
    ],
    sizes: ["1024x1024", "1024x1792", "1792x1024"],
    providerOptions: {
      openai: {
        quality: "hd",
      },
    },
  },
  "dall-e-2": {
    label: "DALL-E 2",
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.image("dall-e-2"),

        // https://platform.openai.com/docs/pricing#image-generation
        getCost: (props) => {
          if (!props) {
            throw new Error("Props are required");
          }

          const { size } = props;

          if (size === "1024x1024") {
            return 0.02;
          }

          if (size === "512x512") {
            return 0.018;
          }

          if (size === "256x256") {
            return 0.016;
          }

          throw new Error("Size is not supported");
        },
      },
    ],
    sizes: ["1024x1024", "512x512", "256x256"],
    priceIndicator: "low",
    providerOptions: {
      openai: {
        quality: "standard",
      },
    },
  },
  "gpt-image-1": {
    label: "GPT Image 1",
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.image("gpt-image-1"),

        // Input (Text): https://platform.openai.com/docs/pricing#latest-models
        // Input (Image): https://platform.openai.com/docs/pricing#text-generation
        // Output: https://platform.openai.com/docs/pricing#image-generation
        getCost: (props) => {
          const priceMap: Record<ImageSize, number> = {
            "1024x1024": 0.167,
            "1024x1536": 0.25,
            "1536x1024": 0.25,
          };

          if (!props) {
            throw new Error("Props are required");
          }

          if (typeof props.size !== "string") {
            throw new Error("Size is required");
          }

          if (typeof props.output !== "number") {
            throw new Error("Output is required");
          }

          if (typeof props.textInput !== "number") {
            throw new Error("Text input is required");
          }

          if (typeof props.imageInput !== "number") {
            throw new Error("Image input is required");
          }

          const { textInput, imageInput, output, size } = props;
          const textInputCost = textInput ? (textInput / million) * 5 : 0;
          const imageInputCost = imageInput ? (imageInput / million) * 10 : 0;
          const outputCost = (output / million) * priceMap[size as ImageSize];

          return textInputCost + imageInputCost + outputCost;
        },
      },
    ],
    supportsEdit: true,
    sizes: ["1024x1024", "1024x1536", "1536x1024"],
    default: true,
    providerOptions: {
      openai: {
        quality: "high",
      },
    },
  },
  "amazon-nova-canvas-v1": {
    label: "Nova Canvas",
    icon: AmazonBedrockIcon,
    chef: providers.amazon,
    providers: [
      {
        ...providers["bedrock"],
        icon: AmazonBedrockIcon,
        model: bedrock.image("amazon.nova-canvas-v1:0"),

        // https://aws.amazon.com/bedrock/pricing/
        getCost: (props) => {
          if (!props) {
            throw new Error("Props are required");
          }

          const { size } = props;

          if (size === "1024x1024") {
            return 0.06;
          }

          if (size === "2048x2048") {
            return 0.08;
          }

          throw new Error("Size is not supported");
        },
      },
    ],

    // Each side must be between 320-4096 pixels, inclusive.
    sizes: ["1024x1024", "2048x2048"],

    providerOptions: {
      bedrock: {
        quality: "premium",
      },
    },
  },
  "flux-pro-1.1": {
    label: "FLUX Pro 1.1",
    chef: providers["black-forest-labs"],
    providers: [
      {
        ...providers["black-forest-labs"],
        model: blackForestLabs.image("flux-pro-1.1"),

        // https://bfl.ai/pricing/api
        getCost: () => 0.04,
      },
    ],
    sizes: ["1024x1024", "832x1440", "1440x832"],
    supportsEdit: true,
  },
  "flux-pro": {
    label: "FLUX Pro",
    chef: providers["black-forest-labs"],
    providers: [
      {
        ...providers["black-forest-labs"],
        model: blackForestLabs.image("flux-pro"),

        // https://bfl.ai/pricing/api
        getCost: () => 0.05,
      },
    ],
    sizes: ["1024x1024", "832x1440", "1440x832"],
    supportsEdit: true,
  },
  "flux-dev": {
    label: "FLUX Dev",
    chef: providers["black-forest-labs"],
    providers: [
      {
        ...providers["black-forest-labs"],
        model: blackForestLabs.image("flux-dev"),

        // https://bfl.ai/pricing/api
        getCost: () => 0.025,
      },
    ],
    sizes: ["1024x1024", "832x1440", "1440x832"],
    supportsEdit: true,
    priceIndicator: "low",
  },
  "flux-pro-1.0-canny": {
    label: "FLUX Pro 1.0 Canny",
    chef: providers["black-forest-labs"],
    providers: [
      {
        ...providers["black-forest-labs"],
        model: blackForestLabs.image("flux-pro-1.0-canny"),

        // https://bfl.ai/pricing/api
        getCost: () => 0.05,
      },
    ],
    sizes: ["1024x1024", "832x1440", "1440x832"],
    supportsEdit: true,
  },
  "flux-pro-1.0-depth": {
    label: "FLUX Pro 1.0 Depth",
    chef: providers["black-forest-labs"],
    providers: [
      {
        ...providers["black-forest-labs"],
        model: blackForestLabs.image("flux-pro-1.0-depth"),

        // https://bfl.ai/pricing/api
        getCost: () => 0.05,
      },
    ],
    sizes: ["1024x1024", "832x1440", "1440x832"],
    supportsEdit: true,
  },
  "flux-kontext-pro": {
    label: "FLUX Kontext Pro",
    chef: providers["black-forest-labs"],
    providers: [
      {
        ...providers["black-forest-labs"],
        model: blackForestLabs.image("flux-kontext-pro"),

        // https://bfl.ai/pricing/api
        getCost: () => 0.04,
      },
    ],
    sizes: ["1024x1024", "832x1440", "1440x832"],
    supportsEdit: true,
  },
  "flux-kontext-max": {
    label: "FLUX Kontext Max",
    chef: providers["black-forest-labs"],
    providers: [
      {
        ...providers["black-forest-labs"],
        model: blackForestLabs.image("flux-kontext-max"),

        // https://bfl.ai/pricing/api
        getCost: () => 0.08,
      },
    ],
    sizes: ["1024x1024", "832x1440", "1440x832"],
    supportsEdit: true,
  },
  "photon-1": {
    label: "Photon 1",
    chef: providers.luma,
    providers: [
      {
        ...providers.luma,
        model: luma.image("photon-1"),

        // https://lumalabs.ai/api/pricing
        getCost: (props) => {
          if (!props) {
            throw new Error("Props are required");
          }

          const { size } = props;

          if (!size) {
            throw new Error("Size is required");
          }

          const [width, height] = size.split("x").map(Number);
          const pixels = width * height;

          return (pixels * 0.0073) / million;
        },
      },
    ],
    sizes: ["1024x1024", "1820x1024", "1024x1820"],
    supportsEdit: true,
  },
  "photon-flash-1": {
    label: "Photon Flash 1",
    chef: providers.luma,
    providers: [
      {
        ...providers.luma,
        model: luma.image("photon-flash-1"),

        // https://lumalabs.ai/api/pricing
        getCost: (props) => {
          if (!props) {
            throw new Error("Props are required");
          }

          const { size } = props;

          if (!size) {
            throw new Error("Size is required");
          }

          const [width, height] = size.split("x").map(Number);
          const pixels = width * height;

          return (pixels * 0.0019) / million;
        },
      },
    ],
    sizes: ["1024x1024", "1820x1024", "1024x1820"],
    supportsEdit: true,
  },
};
