'use client';

import { updateProfileAction } from '@/app/actions/profile/update';
import { Canvas } from '@/components/canvas';
import type { ImageNodeProps } from '@/components/nodes/image';
import type { TextNodeProps } from '@/components/nodes/text';
import { Toolbar } from '@/components/toolbar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { handleError } from '@/lib/error/handle';
import { nodeButtons } from '@/lib/node-buttons';
import { ProjectProvider } from '@/providers/project';
import { useSubscription } from '@/providers/subscription';
import type { projects } from '@/schema';
import { type Edge, type Node, getIncomers, useReactFlow } from '@xyflow/react';
import { PlayIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const TextNode = nodeButtons.find((button) => button.id === 'text');

if (!TextNode) {
  throw new Error('Text node not found');
}

type WelcomeDemoProps = {
  title: string;
  description: string;
  data: typeof projects.$inferSelect;
};

type ContentProps = {
  nodes: Node[];
  edges: Edge[];
};

export const WelcomeDemo = ({ title, description, data }: WelcomeDemoProps) => {
  const { getNodes, getEdges } = useReactFlow();
  const [started, setStarted] = useState(false);
  const { isSubscribed } = useSubscription();
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const [hasTextNode, setHasTextNode] = useState(false);
  const [hasFilledTextNode, setHasFilledTextNode] = useState(false);
  const [hasImageNode, setHasImageNode] = useState(false);
  const [hasConnectedImageNode, setHasConnectedImageNode] = useState(false);
  const [hasImageInstructions, setHasImageInstructions] = useState(false);
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);
  const user = useUser();

  const handleFinishWelcome = async () => {
    if (!user) {
      return;
    }

    try {
      const response = await updateProfileAction(user.id, {
        onboardedAt: new Date(),
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      redirect('/projects');
    } catch (error) {
      handleError('Error finishing onboarding', error);
    }
  };

  const steps = [
    {
      instructions: `${description} Sound good?`,
      action: <Button onClick={() => setStarted(true)}>Sounds good!</Button>,
      complete: started,
    },
    {
      instructions: (
        <>
          Before we start, we need to subscribe to the Hobby plan to claim your
          free AI credits. Click the button below to claim your credits. It
          takes a few seconds and doesn't require a credit card.
        </>
      ),
      action: (
        <div className="not-prose">
          <Button asChild>
            <Link href="/pricing">Claim credits</Link>
          </Button>
        </div>
      ),
      complete: isSubscribed,
    },
    {
      instructions: (
        <>
          First, click the{' '}
          <TextNode.icon className="-translate-y-0.5 inline-block size-4 text-primary" />{' '}
          icon on the bottom toolbar. This will add a Text node to the canvas.
        </>
      ),
      complete: hasTextNode,
    },
    {
      instructions: (
        <>
          Fantastic! That's the first node. Notice the little switch up the top
          right of the node is off? We can this a "human" node because you
          control the content. Try writing a few words or sentences in the node.
          Our favourite is "a wild orchard of delphiniums".
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
          You're getting the hang of it! This Image node is an AI node. You can
          tell because the switch is on. AI nodes generate content based on the
          nodes they're connected to.
          <br />
          <br />
          You can also add a prompt to the Image node. This will be used to
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
          That's all the information we need to generate an awesome image! Click
          the Image node to select it, then press the{' '}
          <PlayIcon className="-translate-y-0.5 inline-block size-4 text-primary" />{' '}
          button to generate content.
        </>
      ),
      complete:
        hasTextNode &&
        hasFilledTextNode &&
        hasImageNode &&
        hasConnectedImageNode &&
        hasImageInstructions &&
        hasGeneratedImage,
    },
    {
      instructions: (
        <>
          That's it! You've created your first AI-powered workflow. You can
          continue to add more nodes to a canvas to create more complex flows
          and discover the power of Tersa.
        </>
      ),
      action: (
        <div className="not-prose">
          <Button asChild onClick={handleFinishWelcome}>
            <Link href="/projects">Continue</Link>
          </Button>
        </div>
      ),
      complete: false,
    },
  ];

  const activeStep = steps.find((step) => !step.complete) ?? steps[0];
  const previousSteps = steps.slice(0, steps.indexOf(activeStep));

  // biome-ignore lint/correctness/useExhaustiveDependencies: "we want to listen to activeStep"
  useEffect(() => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTo({
        top: stepsContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeStep.instructions]);

  const handleNodesChange = useCallback(() => {
    const newEdges = getEdges();
    const newNodes = getNodes();

    const textNodes = newNodes.filter((node) => node.type === 'text');

    if (!textNodes.length) {
      setHasTextNode(false);
      return;
    }

    setHasTextNode(true);

    const textNode = textNodes.at(0);

    if (!textNode) {
      return;
    }

    const text = (textNode as unknown as TextNodeProps).data.text;

    if (text && text.length > 10) {
      setHasFilledTextNode(true);
    } else {
      setHasFilledTextNode(false);
    }

    const imageNodes = newNodes.filter((node) => node.type === 'image');
    const imageNode = imageNodes.at(0);

    if (!imageNode) {
      setHasImageNode(false);
      return;
    }

    setHasImageNode(true);

    const sources = getIncomers(imageNode, newNodes, newEdges);
    const textSource = sources.find((source) => source.id === textNode.id);

    if (!textSource) {
      setHasConnectedImageNode(false);
      return;
    }

    setHasConnectedImageNode(true);

    const image = imageNode as unknown as ImageNodeProps;
    const instructions = image.data.instructions;

    if (instructions && instructions.length > 5) {
      setHasImageInstructions(true);
    } else {
      setHasImageInstructions(false);
    }

    if (!image.data.generated?.url) {
      setHasGeneratedImage(false);
      return;
    }

    setHasGeneratedImage(true);
  }, [getNodes, getEdges]);

  return (
    <div className="grid h-screen w-screen grid-cols-3">
      <div className="size-full overflow-auto p-16" ref={stepsContainerRef}>
        <div className="prose flex flex-col items-start gap-4">
          <h1 className="font-semibold! text-3xl!">{title}</h1>
          {previousSteps.map((step, index) => (
            <p key={index} className="lead opacity-50">
              {step.instructions}
            </p>
          ))}

          <p className="lead">{activeStep?.instructions}</p>
          {activeStep?.action}
        </div>
      </div>
      <div className="col-span-2 p-8">
        <div className="relative size-full overflow-hidden rounded-3xl border">
          <ProjectProvider data={data}>
            <Canvas
              data={data}
              canvasProps={{
                onNodesChange: handleNodesChange,
              }}
            >
              {steps[0].complete && <Toolbar />}
            </Canvas>
          </ProjectProvider>
        </div>
      </div>
    </div>
  );
};
