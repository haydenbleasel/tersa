'use client';

import { Canvas } from '@/components/canvas';
import type { TextNodeProps } from '@/components/nodes/text';
import { Toolbar } from '@/components/toolbar';
import { Button } from '@/components/ui/button';
import { nodeButtons } from '@/lib/node-buttons';
import { ProjectProvider } from '@/providers/project';
import { SubscriptionProvider } from '@/providers/subscription';
import type { projects } from '@/schema';
import { type Edge, type Node, useReactFlow } from '@xyflow/react';
import { PlayIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

const TextNode = nodeButtons.find((button) => button.id === 'text');

if (!TextNode) {
  throw new Error('Text node not found');
}

type WelcomeDemoProps = {
  title: string;
  description: string;
  data: typeof projects.$inferSelect;
  subscribed: boolean;
};

type ContentProps = {
  nodes: Node[];
  edges: Edge[];
};

export const WelcomeDemo = ({
  title,
  description,
  data,
  subscribed,
}: WelcomeDemoProps) => {
  const { getNodes } = useReactFlow();
  const content = data.content as ContentProps | null;
  const [started, setStarted] = useState(false);
  const [nodes, setNodes] = useState(content?.nodes ?? []);

  const hasFilledTextNode = useMemo(
    () =>
      nodes.some((node) => node.type === 'text') &&
      nodes.some((node) => {
        const text = (node as unknown as TextNodeProps).data.text;

        return text && text.length > 10;
      }),
    [nodes]
  );

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
      complete: !subscribed,
    },
    {
      instructions: (
        <>
          First, click the{' '}
          <TextNode.icon className="-translate-y-0.5 inline-block size-4 text-primary" />{' '}
          icon on the bottom toolbar. This will add a Text node to the canvas.
        </>
      ),
      complete: nodes.filter((node) => node.type === 'text').length,
    },
    {
      instructions: (
        <>
          Fantastic! That's the first node. Notice the little switch up the top
          right of the node is off? We can this a "human" node because you
          control the content. Try writing a few words or sentences in the node.
        </>
      ),
      complete: hasFilledTextNode,
    },
    {
      instructions: (
        <>
          Excellent work! Now, let's attach it to an Image node. Drag the handle
          on the right of the Text node into blank space and drop it. You'll be
          prompted to select a node type. Select the Image node.
        </>
      ),
      complete: nodes.filter((node) => node.type === 'image').length,
    },
    {
      instructions: (
        <>
          You're getting the hang of it! This Image node is an AI node. You can
          tell because the switch is on. AI nodes generate content based on the
          nodes they're connected to.
          <br />
          <br />
          Click the Image node to select it, then press the{' '}
          <PlayIcon className="-translate-y-0.5 inline-block size-4 text-primary" />{' '}
          button to generate content.
        </>
      ),
      action: <Button>Continue</Button>,
    },
  ];

  const activeStep = steps.find((step) => !step.complete) ?? steps[0];
  const previousSteps = steps.slice(0, steps.indexOf(activeStep));

  const handleNodesChange = useCallback(() => {
    const nodes = getNodes();

    setNodes(nodes);
  }, [getNodes]);

  return (
    <div className="grid h-screen w-screen grid-cols-3">
      <div className="size-full overflow-auto p-16">
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
            <SubscriptionProvider isSubscribed={false} plan={undefined}>
              <Canvas
                data={data}
                canvasProps={{
                  onNodesChange: handleNodesChange,
                }}
              >
                {steps[0].complete && <Toolbar />}
              </Canvas>
            </SubscriptionProvider>
          </ProjectProvider>
        </div>
      </div>
    </div>
  );
};
