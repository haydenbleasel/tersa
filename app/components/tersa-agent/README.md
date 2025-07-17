# Tersa Agent Integration Guide

## Quick Start

### 1. Add the Command Menu to Your Layout

In your main layout or page component:

```tsx
import { CommandMenu } from '@/app/components/command-menu';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <CommandMenu />
    </>
  );
}
```

### 2. Wrap Canvas with Required Providers

The agent needs access to ReactFlow and NodeOperations contexts:

```tsx
import { ReactFlowProvider } from '@xyflow/react';
import { NodeOperationsProvider } from '@/providers/node-operations';
import { Canvas } from '@/components/canvas';

export default function WorkflowPage() {
  return (
    <ReactFlowProvider>
      <Canvas>
        {/* Your canvas content */}
      </Canvas>
    </ReactFlowProvider>
  );
}
```

### 3. Open the Agent

- Press `⌘K` to open command menu, then select "Ask Tersa Agent"
- Press `⌘⇧K` to open agent directly

## Example Commands

### Basic Node Operations
- "Add a text node"
- "Create a GPT-4 transform node"
- "Connect the selected nodes"
- "Delete all transform nodes"

### Workflow Generation
- "Create a workflow that transcribes audio and summarizes it"
- "Build a pipeline for processing images with AI"
- "Generate a chatbot workflow"

### Analysis & Optimization
- "Analyze this workflow for bottlenecks"
- "Optimize for speed"
- "What's the estimated cost of running this?"
- "Suggest better AI models for my use case"

## API Integration

### Direct API Usage

```tsx
// In a server action or API route
import { tersaAgent } from '@/lib/mastra';

const response = await tersaAgent.generate({
  messages: [{ role: 'user', content: 'Create a summarization workflow' }],
  runtimeContext: new Map([
    ['user-tier', 'pro'],
    ['canvas-state', canvasState],
  ]),
});
```

### Custom Hook Usage

```tsx
import { useTersaAgent } from '@/lib/hooks/use-tersa-agent';

function MyComponent() {
  const { streamResponse, isGenerating } = useTersaAgent();
  
  const handleQuery = async (message: string) => {
    const stream = await streamResponse({
      message,
      context: { canvasState },
    });
    
    for await (const chunk of stream) {
      if (chunk.type === 'text-delta') {
        // Handle text updates
      } else if (chunk.type === 'tool-call') {
        // Handle canvas operations
      }
    }
  };
}
```

## Customization

### Adding Custom Tools

1. Create a new tool in `lib/mastra/tools/`:

```typescript
export const myCustomTool = createTool({
  id: 'my-custom-tool',
  description: 'Does something custom',
  inputSchema: z.object({
    param: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ context }) => {
    // Your implementation
    return { result: 'Success' };
  },
});
```

2. Add to agent configuration in `lib/mastra/agents/tersa-agent/index.ts`

### Customizing UI

The agent UI components are in `app/components/tersa-agent/`:
- `agent-chat.tsx` - Main chat interface
- `agent-prompt-input.tsx` - Input handling
- `agent-streaming.tsx` - Response rendering

## Troubleshooting

### Agent not responding
- Check browser console for errors
- Verify API keys are set in environment
- Ensure user is authenticated

### Canvas operations not working
- Verify ReactFlowProvider is wrapping your component
- Check that NodeOperationsProvider is configured
- Ensure canvas bridge hook has access to ReactFlow instance

### Memory/Context issues
- Agent memory is stored in LibSQL database
- Clear memory by deleting `tersa-agent-memory.db`
- Check runtime context is properly configured