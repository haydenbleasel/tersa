# Tersa Agent Components

This directory contains the UI components for the Tersa Agent - an intelligent AI assistant integrated into the Tersa visual workflow builder.

## Components

### `agent-chat.tsx`
The main chat interface component that handles:
- Message display and streaming
- Multiple view modes (overlay, sidebar, modal)
- Approval flow for destructive operations
- Real-time status updates
- Mobile-responsive design

### `agent-prompt-input.tsx`
Multi-modal input component featuring:
- Text input with auto-resize
- File upload support (drag & drop)
- Node tagging with `@` mentions
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Loading states during streaming

### `agent-streaming.tsx`
Markdown rendering component that:
- Renders streaming responses with proper formatting
- Supports code blocks with syntax highlighting
- Handles inline code and formatting
- Provides smooth animation for incoming text

### `agent-context-tags.tsx`
Visual context indicator showing:
- Currently selected nodes
- Tagged nodes in messages
- Click to focus on canvas
- Remove tags functionality

### `mcp-config-modal.tsx`
Configuration modal for MCP (Model Context Protocol) servers:
- Add/remove MCP server endpoints
- Manage API keys securely
- Test connections
- Dynamic tool discovery

## Usage

```tsx
import { AgentChat } from '@/app/components/tersa-agent/agent-chat';

function MyComponent() {
  const [agentMode, setAgentMode] = useState<'overlay' | 'sidebar' | 'modal'>('overlay');
  const [showAgent, setShowAgent] = useState(false);

  return (
    <>
      {showAgent && (
        <AgentChat
          mode={agentMode}
          onModeChange={setAgentMode}
          onClose={() => setShowAgent(false)}
        />
      )}
    </>
  );
}
```

## Features

### Streaming Responses
The agent uses Server-Sent Events (SSE) to stream responses in real-time, providing immediate feedback as the AI processes requests.

### Approval Flow
Destructive operations (like deleting nodes) require explicit user approval:
1. Agent proposes the action
2. User sees Approve/Reject buttons
3. Action executes only after approval

### Context Awareness
The agent maintains awareness of:
- Selected nodes on the canvas
- Current workflow structure
- Previous conversation history
- User preferences and tier

### Real-time Collaboration
When multiple users are working on the same project:
- Agent actions are broadcast to all users
- Canvas updates appear in real-time
- Conflict resolution through operation ordering

## Styling

Components use:
- Tailwind CSS for utility-first styling
- CSS-in-JS for dynamic styles
- Framer Motion for animations
- Responsive design patterns

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- High contrast mode support

## Testing

See `tests/components/agent-chat.test.tsx` for component tests covering:
- User interactions
- Streaming behavior
- Approval flow
- Mode switching
- Error handling