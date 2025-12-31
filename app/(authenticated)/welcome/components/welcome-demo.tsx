"use client";

import { getIncomers, useReactFlow } from "@xyflow/react";
import { PlayIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateProfileAction } from "@/app/actions/profile/update";
import { Canvas } from "@/components/canvas";
import type { ImageNodeProps } from "@/components/nodes/image";
import type { TextNodeProps } from "@/components/nodes/text";
import { Toolbar } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { handleError } from "@/lib/error/handle";
import { nodeButtons } from "@/lib/node-buttons";
import { useProject } from "@/providers/project";

const TextNode = nodeButtons.find((button) => button.id === "text");

if (!TextNode) {
  throw new Error("Text node not found");
}

type WelcomeDemoProps = {
  title: string;
  description: string;
};

export const WelcomeDemo = ({ title, description }: WelcomeDemoProps) => {
  const project = useProject();
  const { getNodes, getEdges } = useReactFlow();
  const [started, setStarted] = useState(false);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const [hasTextNode, setHasTextNode] = useState(false);
  const [hasFilledTextNode, setHasFilledTextNode] = useState(false);
  const [hasImageNode, setHasImageNode] = useState(false);
  const [hasConnectedImageNode, setHasConnectedImageNode] = useState(false);
  const [hasImageInstructions, setHasImageInstructions] = useState(false);
  const user = useUser();
  const router = useRouter();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Run only on mount
  useEffect(() => {
    handleNodesChange();
  }, []);

  const handleFinishWelcome = async () => {
    if (!(user && project?.id)) {
      return;
    }

    try {
      const response = await updateProfileAction(user.id, {
        onboardedAt: new Date(),
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      router.push(`/projects/${project.id}`);
    } catch (error) {
      handleError("Error finishing onboarding", error);
    }
  };

  const steps = [
    {
      instructions: `${description} Sound good?`,
      action: (
        <div className="not-prose flex items-center gap-4">
          <Button onClick={() => setStarted(true)}>Sounds good!</Button>
          <Button onClick={handleFinishWelcome} variant="outline">
            Skip intro
          </Button>
        </div>
      ),
      complete: started,
    },
    {
      instructions: (
        <>
          First, click the{" "}
          <TextNode.icon className="inline-block size-4 -translate-y-0.5 text-primary" />{" "}
          icon on the bottom toolbar. This will add a Text node to the canvas.
        </>
      ),
      complete: hasTextNode,
    },
    {
      instructions: (
        <>
          Fantastic! That's the first node. Because there's no incoming nodes,
          you control the content. Try writing a few words or sentences in the
          node. Our favourite is "a wild field of delphiniums".
        </>
      ),
      complete: hasTextNode && hasFilledTextNode,
    },
    {
      instructions: (
        <>
          Excellent work! Now, let's attach it to an Image node. Drag the handle
          on the right of the Text node into blank space and drop it. You'll be
          prompted to select a node type. Select the Image node.
        </>
      ),
      complete:
        hasTextNode &&
        hasFilledTextNode &&
        hasImageNode &&
        hasConnectedImageNode,
    },
    {
      instructions: (
        <>
          You're getting the hang of it! Because this node has incoming nodes
          connected to it, it will generate content with AI based on the
          incoming nodes.
          <br />
          <br />
          You can also add instructions to the Image node. This will be used to
          influence the outcome. Try adding some instructions to the Image node,
          maybe something like "make it anime style".
        </>
      ),
      complete:
        hasTextNode &&
        hasFilledTextNode &&
        hasImageNode &&
        hasConnectedImageNode &&
        hasImageInstructions,
    },
    {
      instructions: (
        <>
          That's all the information we need to generate an awesome image! Once
          you upgrade to a paid plan, click the Image node to select it, then
          press the{" "}
          <PlayIcon className="inline-block size-4 -translate-y-0.5 text-primary" />{" "}
          button to generate content.
        </>
      ),
      action: (
        <div className="not-prose">
          <Button asChild onClick={handleFinishWelcome}>
            <Link href="/">Continue</Link>
          </Button>
        </div>
      ),
      complete:
        hasTextNode &&
        hasFilledTextNode &&
        hasImageNode &&
        hasConnectedImageNode &&
        hasImageInstructions,
    },
  ];

  const activeStep = steps.find((step) => !step.complete) ?? steps[0];
  const previousSteps = steps.slice(0, steps.indexOf(activeStep));

  // biome-ignore lint/correctness/useExhaustiveDependencies: "we want to listen to activeStep"
  useEffect(() => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTo({
        top: stepsContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeStep.instructions]);

  const handleNodesChange = useCallback(() => {
    setTimeout(() => {
      const newEdges = getEdges();
      const newNodes = getNodes();

      const textNodes = newNodes.filter((node) => node.type === "text");
      const textNode = textNodes.at(0);

      setHasTextNode(textNodes.length > 0);

      if (!textNode) {
        return;
      }

      const text = (textNode as unknown as TextNodeProps).data.text;
      setHasFilledTextNode(Boolean(text && text.length > 10));

      const imageNodes = newNodes.filter((node) => node.type === "image");
      const imageNode = imageNodes.at(0);

      setHasImageNode(Boolean(imageNode));

      if (!imageNode) {
        return;
      }

      const sources = getIncomers(imageNode, newNodes, newEdges);
      const isConnected = sources.some((source) => source.id === textNode.id);
      setHasConnectedImageNode(isConnected);

      if (!isConnected) {
        return;
      }

      const image = imageNode as unknown as ImageNodeProps;
      setHasImageInstructions(
        Boolean(image.data.instructions && image.data.instructions.length > 5)
      );
    }, 50);
  }, [getNodes, getEdges]);

  return (
    <div className="grid h-screen w-screen grid-rows-3 lg:grid-cols-3 lg:grid-rows-1">
      <div
        className="size-full overflow-auto p-8 lg:p-16"
        ref={stepsContainerRef}
      >
        <div className="prose flex flex-col items-start gap-4">
          <h1 className="font-semibold! text-3xl!">{title}</h1>
          {previousSteps.map((step) => (
            <p
              className="lead opacity-50"
              key={
                typeof step.instructions === "string"
                  ? step.instructions
                  : step.instructions.props.children.toString().slice(0, 50)
              }
            >
              {step.instructions}
            </p>
          ))}

          <p className="lead">{activeStep?.instructions}</p>
          {activeStep?.action}
        </div>
      </div>
      <div className="row-span-3 p-8 lg:col-span-2 lg:row-span-1">
        <div className="relative size-full overflow-hidden rounded-3xl border">
          <Canvas onNodesChange={handleNodesChange}>
            {steps[0].complete ? <Toolbar /> : null}
          </Canvas>
        </div>
      </div>
    </div>
  );
};
