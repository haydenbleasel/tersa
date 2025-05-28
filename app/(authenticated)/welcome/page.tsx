import { Canvas } from '@/components/canvas';
import { nodeButtons } from '@/lib/node-buttons';
import { ProjectProvider } from '@/providers/project';
import { SubscriptionProvider } from '@/providers/subscription';
import type { projects } from '@/schema';

const TextNode = nodeButtons.find((button) => button.id === 'text');

if (!TextNode) {
  throw new Error('Text node not found');
}

const Welcome = () => {
  const project: typeof projects.$inferSelect = {
    id: '1',
    name: 'Project 1',
    transcriptionModel: 'whisper',
    visionModel: 'openai',
    createdAt: new Date(),
    updatedAt: new Date(),
    content: {},
    userId: '1',
    image: null,
    members: [],
  };

  return (
    <div className="grid h-screen w-screen grid-cols-3">
      <div className="self-center px-16 py-8">
        <div className="prose">
          <h1 className="font-semibold! text-3xl!">Welcome to Tersa!</h1>
          <p className="lead">
            Tersa is a platform for creating and sharing AI-powered projects.
            Let's get started by creating a flow, together.
          </p>
          <p>
            First, click the{' '}
            <TextNode.icon className="inline-block size-4 align-text-bottom" />{' '}
            Text node on the bottom toolbar.
          </p>
        </div>
      </div>
      <div className="col-span-2 p-8">
        <div className="relative size-full overflow-hidden rounded-3xl border">
          <ProjectProvider data={project}>
            <SubscriptionProvider isSubscribed={false} plan={undefined}>
              <Canvas data={project} />
            </SubscriptionProvider>
          </ProjectProvider>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
