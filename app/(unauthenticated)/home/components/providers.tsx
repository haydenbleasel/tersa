"use client";

import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";
import type { OpenAiIcon } from "@/lib/icons";

import { imageModels } from "@/lib/models/image";
import { speechModels } from "@/lib/models/speech";
import { transcriptionModels } from "@/lib/models/transcription";
import { videoModels } from "@/lib/models/video";
import { visionModels } from "@/lib/models/vision";
import { providers } from "@/lib/providers";
import { useGateway } from "@/providers/gateway/client";

export const Providers = () => {
  const { models: textModels } = useGateway();

  const allModels = [
    ...Object.values(imageModels),
    ...Object.values(speechModels),
    ...Object.values(transcriptionModels),
    ...Object.values(videoModels),
    ...Object.values(visionModels),
    ...Object.values(textModels),
  ];

  const icons = new Set<typeof OpenAiIcon>();

  for (const model of Object.values(allModels)) {
    icons.add(model.icon ?? model.chef.icon);
  }

  const iconsArray = Array.from(icons);
  const half = Math.ceil(iconsArray.length / 2);
  const row1 = iconsArray.slice(0, half);
  const row2 = iconsArray.slice(half);

  return (
    <div className="relative grid w-full grid-cols-[0.2fr_3fr_0.2fr] md:grid-cols-[0.5fr_3fr_0.5fr]">
      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 left-0 h-8 bg-gradient-to-b from-background to-transparent" />
        {/* <div className="absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-t from-background to-transparent" /> */}
        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Top row */}
      <div className="border-b border-dotted" />
      <div className="border-x border-b border-dotted py-6" />
      <div className="border-b border-dotted" />

      {/* Middle row - main content */}
      <div className="border-b border-dotted" />
      <div className="relative flex items-center justify-center border-x border-b border-dotted">
        {/* Corner decorations */}
        <div className="-left-[3px] -top-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>
        <div className="-right-[3px] -top-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>
        <div className="-bottom-[3px] -left-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>
        <div className="-bottom-[3px] -right-[3px] absolute">
          <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
        </div>

        {/* Main content */}
        <div className="grid items-center justify-center py-8">
          <div className="px-5">
            <h2 className="mt-6 mb-5 text-center font-medium text-3xl tracking-[-0.12rem] sm:text-4xl md:text-5xl">
              Powered by the world's leading AI providers
            </h2>

            <p className="mx-auto max-w-lg text-center text-muted-foreground tracking-[-0.01rem] sm:text-lg">
              Connect your workflows to {allModels.length} models from{" "}
              {Object.keys(providers).length} of the world's top AI providers,
              including OpenAI, Anthropic, and more.
            </p>
          </div>

          <Marquee className="mt-12">
            <MarqueeFade side="left" />
            <MarqueeFade side="right" />
            <MarqueeContent pauseOnHover={false}>
              {row1.map((Icon) => (
                <MarqueeItem className="h-32 w-32 p-8" key={Icon.name}>
                  <Icon className="size-full" />
                </MarqueeItem>
              ))}
            </MarqueeContent>
            <MarqueeContent direction="right" pauseOnHover={false}>
              {row2.map((Icon) => (
                <MarqueeItem className="h-32 w-32 p-8" key={Icon.name}>
                  <Icon className="size-full" />
                </MarqueeItem>
              ))}
            </MarqueeContent>
          </Marquee>
        </div>
      </div>
      <div className="border-b border-dotted" />

      {/* Spacer */}
      <div className="h-16" />
      <div className="border-x border-dotted" />
      <div className="" />
    </div>
  );
};
