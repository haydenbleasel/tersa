## What this adds

Tersa Agent - an AI assistant that helps users build workflows through natural language. Ask it to create nodes, connect them, or build entire workflows and it handles the canvas operations for you.

## Key features

- **Natural language to canvas**: "Create a workflow that transcribes audio and summarizes it" → builds the entire flow
- **Smart context**: Knows what nodes are selected, understands the canvas state
- **Safety first**: Destructive operations (like deleting nodes) require approval before executing
- **Undo/rollback**: Made a mistake? Just ask to rollback the last change
- **Real-time collaboration**: See what the agent is doing across all users in a project
- **MCP support**: Add custom tools via Model Context Protocol servers

## How it works

1. Press `⌘K` → "Ask Tersa Agent" (or `⌘⇧K` for quick access)
2. Type what you want: "Add a GPT-4 transform node"
3. Watch it work - with visual feedback and animations
4. For dangerous operations, approve or reject before execution

## Technical implementation

Built with:
- Mastra AI framework for the agent logic
- Server-sent events for streaming responses
- Supabase for memory persistence (with in-memory fallback)
- Full TypeScript, comprehensive tests

## What's included

- Complete agent implementation with sub-agents for complex reasoning
- UI components (chat, prompt input, streaming markdown)
- API routes for chat and streaming
- Canvas bridge hooks for executing operations
- Unit tests, integration tests, and E2E tests
- Documentation and usage examples

## Try it out

```bash
pnpm install
pnpm dev
# Press ⌘⇧K to open the agent
```

## Known limitations

- A few non-critical TypeScript warnings in workflow files
- Collaboration features need a real multi-user environment to fully test
- No voice input (yet)

Looking forward to your feedback!