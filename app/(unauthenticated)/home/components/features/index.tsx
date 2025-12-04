import { CableIcon, GrabIcon, MoveIcon, PlayIcon } from "lucide-react";
import { CodeDemo } from "./code-demo";
import { ImageDemo } from "./image-demo";
import { SpeechDemo } from "./speech-demo";
import { TextDemo } from "./text-demo";
import { VideoDemo } from "./video-demo";

export const Features = () => (
  <div className="relative grid w-full grid-cols-[0.2fr_3fr_0.2fr] md:grid-cols-[0.5fr_3fr_0.5fr]">
    {/* Gradient overlays */}
    <div className="pointer-events-none absolute inset-0">
      {/* <div className="absolute top-0 right-0 left-0 h-8 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-t from-background to-transparent" /> */}
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
      <div className="grid items-center justify-center px-5 py-8">
        <h2 className="mt-6 mb-5 text-center font-medium text-3xl tracking-[-0.12rem] sm:text-4xl md:text-5xl">
          <MoveIcon className="ml-1 inline-block size-5 align-baseline sm:ml-2 sm:size-7 md:ml-3 md:size-8" />{" "}
          Drag,{" "}
          <GrabIcon className="ml-1 inline-block size-5 align-baseline sm:ml-2 sm:size-7 md:ml-3 md:size-8" />{" "}
          drop,
          <CableIcon className="ml-1 inline-block size-5 align-baseline sm:ml-2 sm:size-7 md:ml-3 md:size-8" />{" "}
          connect and{" "}
          <PlayIcon className="ml-1 inline-block size-5 align-baseline sm:ml-2 sm:size-7 md:ml-3 md:size-8" />{" "}
          run
        </h2>

        <p className="mx-auto max-w-lg text-center text-muted-foreground tracking-[-0.01rem] sm:text-lg">
          Tersa uses a drag and drop interface to build workflows, making it
          super easy to create complex workflows with ease.
        </p>
      </div>
    </div>
    <div className="border-b border-dotted" />

    {/* Bottom row - buttons */}
    <div className="border-b border-dotted" />
    <div className="relative flex items-center justify-center border-x border-b border-dotted">
      {/* Corner decorations */}
      <div className="-bottom-[3px] -left-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>
      <div className="-bottom-[3px] -right-[3px] absolute">
        <div className="relative z-1 h-[5px] w-[5px] transform rounded-full bg-border ring-2 ring-background" />
      </div>

      {/* Buttons */}
      <div className="grid w-full sm:grid-cols-2">
        <div className="grid gap-4 border-b border-dotted p-8 sm:border-r sm:border-b-0">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <TextDemo />
          </div>
          <div className="grid gap-2">
            <h3 className="font-medium text-xl sm:text-2xl">
              Synthesize answers
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Use models like GPT-4o, Claude 3.5 Sonnet and more to generate
              text from incoming nodes. Connect text nodes for prompts and image
              nodes for attachments.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-8">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <ImageDemo />
          </div>
          <div className="grid gap-2">
            <h3 className="font-medium text-xl sm:text-2xl">Generate images</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Use models like DALL-E 3 to generate images from text prompts and
              audio transcriptions, or gpt-image-1 to create variations of
              existing images.
            </p>
          </div>
        </div>

        <div className="grid items-start gap-8 border-y border-dotted p-8 sm:col-span-2 lg:grid-cols-3">
          <div className="aspect-video w-full overflow-hidden rounded-lg border lg:col-span-2">
            <VideoDemo />
          </div>
          <div className="grid gap-2">
            <h3 className="font-medium text-xl sm:text-2xl">Create videos</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Use models like Minimax's T2V-01-Director on Runway's Gen4 Turbo
              to create videos from text prompts, or connect an image node to
              create a video from an existing image.
            </p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-dotted p-8 sm:border-r sm:border-b-0">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <SpeechDemo />
          </div>
          <div className="grid gap-2">
            <h3 className="font-medium text-xl sm:text-2xl">
              Capture and narrate speech
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Use models like OpenAI's Whisper to transcribe audio from incoming
              nodes. Connect text nodes to provide prompts and audio nodes to
              attach them to the request.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-8">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <CodeDemo />
          </div>
          <div className="grid gap-2">
            <h3 className="font-medium text-xl sm:text-2xl">
              Transform and refactor code
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Use AI models to analyze, refactor, and optimize your code.
              Connect code nodes to provide source files and text nodes to
              specify transformation instructions or requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="border-b border-dotted" />

    {/* Spacer */}
    <div className="h-16" />
    <div className="border-x border-dotted" />
    <div className="" />
  </div>
);
