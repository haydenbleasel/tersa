# Tersa Agent - Mastra Integration

## Overview

The Tersa Agent is an intelligent AI assistant integrated into the Tersa visual workflow builder. It uses the Mastra AI framework to provide natural language understanding, workflow generation, and canvas manipulation capabilities.

## Phase 2 Updates

### Enhanced Features
- **Supabase Memory Adapter**: User-specific memory persistence with in-memory fallback
- **Credit Integration**: Usage tracking with Stripe billing
- **Visual Feedback**: Toast notifications and animations for canvas operations
- **Reasoning Visibility**: Optional display of agent thought process
- **Mobile Support**: Responsive UI with touch-friendly interactions
- **Natural Language Workflows**: Parse descriptions into visual workflows
- **Sub-Agents**: Reasoning sub-agent for complex NL tasks
- **Dynamic Tools**: MCP support for user-configurable tools

## Phase 3 Features

### MCP Integration
- **Configuration Modal**: Access via ⌘⇧M in command menu
- **Dynamic Tool Loading**: Tools from MCP servers available at runtime
- **Server Management**: Add/remove MCP servers with optional API keys

### Autonomy Features
- **Approval Flow**: Destructive operations require user confirmation
- **Rollback**: Undo last canvas operation with history tracking
- **Visual Indicators**: Clear approval/rejection status in chat

### Collaboration
- **Real-time Broadcast**: Agent actions shared across users
- **Project Channels**: Supabase channels for multi-user sessions
- **Action Notifications**: Toast alerts for remote user actions

## Architecture

### Core Components

1. **Mastra Agent** (`lib/mastra/agents/tersa-agent/`)
   - Configured with memory and context awareness
   - Dynamic model selection based on user tier
   - Tool-calling capabilities for canvas manipulation

2. **Tools** (`lib/mastra/tools/`)
   - `canvas-tools.ts`: Node and edge manipulation
   - `workflow-tools.ts`: Workflow execution and management
   - `analysis-tools.ts`: Performance analysis and optimization
   - `search-tools.ts`: Web and documentation search

3. **Workflows** (`lib/mastra/workflows/`)
   - `node-generation.ts`: Natural language to workflow conversion
   - `optimization.ts`: Workflow analysis and optimization

4. **UI Components** (`app/components/tersa-agent/`)
   - `agent-chat.tsx`: Main chat interface
   - `agent-prompt-input.tsx`: Multi-modal input handling
   - `agent-streaming.tsx`: Real-time response rendering
   - `agent-context-tags.tsx`: Node context visualization

5. **API Routes** (`app/api/agent/`)
   - `/chat`: Single response generation
   - `/stream`: Server-sent events for streaming

## Usage

### Opening the Agent

- **Command Menu**: Press `⌘K` and select "Ask Tersa Agent"
- **Direct Hotkey**: Press `⌘⇧K` to open agent directly
- **Toolbar**: Click the agent button (when implemented)

### Basic Commands

```
# Creating Nodes
"Create a text node with a prompt for blog post ideas"
"Add a GPT-4 transform node to summarize content"
"Create an image generation node using DALL-E"

# Working with Workflows
"Create a workflow that transcribes audio and summarizes it"
"Build a content pipeline that extracts text from PDFs and translates it"
"Design a parallel processing system for batch image optimization"

# Canvas Operations
"Connect the selected nodes"
"Arrange nodes in a horizontal layout"
"Delete unused nodes" (requires approval)
"Show me all transform nodes"

# Analysis & Optimization
"Analyze this workflow for bottlenecks"
"Optimize for speed vs cost"
"What AI models work best for code generation?"
"Check for redundant operations"
```

### Advanced Commands

```
# Complex Workflows
"Create a multi-stage pipeline that:
 1. Accepts user input
 2. Generates variations with different models
 3. Scores each variation
 4. Picks the best one"

# Reasoning & Planning
"Help me design a content moderation system"
"Plan a workflow for processing customer feedback"
"Reason through the best approach for real-time translation"

# Destructive Operations (require approval)
"Delete all nodes"
"Clear the canvas"
"Remove all connections"

# History & Rollback
"Rollback the last change"
"Undo the last 3 operations"
"Show me what changed in the last action"
```

### MCP Configuration

1. Press `⌘K` to open command menu
2. Select "Configure MCP Tools" or press `⌘⇧M`
3. Add MCP server URLs and optional API keys
4. Tools from servers will be available in next chat

Example MCP servers:
- `http://localhost:8080/mcp` - Local development server
- `https://api.example.com/mcp` - Production MCP endpoint

### Context-Aware Features

The agent automatically:
- Knows which nodes are selected on the canvas
- Understands the current workflow structure
- Remembers conversation history for continuity
- Adapts responses based on user tier (basic/pro)
- Provides visual feedback for canvas operations
- Broadcasts changes for real-time collaboration

### Pro Tips

1. **Selection Context**: Select nodes before asking questions about them
2. **Natural Language**: Describe what you want to achieve, not how
3. **Iterative Building**: Start simple and refine with follow-up commands
4. **Approval Flow**: Review destructive operations before confirming
5. **Undo Safety**: Use rollback if an operation has unexpected results

## Implementation Details

### Memory System

Uses LibSQL for persistent memory with:
- Last 30 messages retained
- Semantic recall for relevant context
- Working memory for session state

### Runtime Context

Dynamic configuration based on:
- User tier (basic/pro)
- Model preferences
- Canvas state
- Available credits

### Tool Execution

Tools are executed in two phases:
1. Server-side validation and planning
2. Client-side canvas manipulation

## Development

### Adding New Tools

1. Create tool in `lib/mastra/tools/`
2. Export from `tools/index.ts`
3. Add to agent configuration
4. Implement client-side handler in canvas bridge

### Testing

```bash
# Start development server
pnpm dev

# Test agent locally
# Open browser, press ⌘⇧K
# Try various commands
```

### Environment Variables

```
TERSA_AGENT_MEMORY_URL=file:./tersa-agent-memory.db
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Limitations

- Canvas operations require client-side execution
- Real-time sync depends on Supabase broadcast
- Credit system limits usage
- Some features restricted to pro tier

## Future Enhancements

1. **MCP Integration**: Allow users to add custom tools
2. **Collaborative Features**: Shared agent sessions
3. **Advanced Workflows**: Multi-agent operations
4. **Voice Interface**: Audio input/output
5. **Canvas Recording**: Replay agent actions