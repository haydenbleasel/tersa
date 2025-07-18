## Motivation

Enhance Tersa with AI-native chat for seamless workflow building—natural language to nodes/edges, autonomy (sub-agents/tools/workflows/MCP), safety (approval/rollback), collab (real-time broadcast), per plan.

## Phases/Features

**Foundation**: Mastra setup (agents/chat/instructions, basic tools/workflows/memory Supabase/fallback, UI chat/modal/overlay/prompt/streaming/tags, cmd-k sticky/CommandDialog/Item, hooks use-tersa-agent/canvas-bridge/agent-context/mcp, API chat/stream).

**Core**: Sub-agents (reasoning for NL/complex delegate/call), dynamic tools (MCPClient/getToolsets from runtime.mcpServers), UI refinements (drag-drop tagging/react-dnd, visual toast/animate/FitView, mode switch, mobile media/full-screen).

**Advanced**: MCP modal (cmd-k "Configure Tools"/⌘⇧M Form/array/url/key save jsonb profiles.mcp_servers via use-mcp/update.ts), autonomy (needsConfirm delete, pendingApproval Buttons/pause/resume, rollbackTool/history save/apply/getLastState), collab (channel send/on broadcast payload/executeRemote/toast filter self).

**Final**: TS fixes (overloads/messages, runtime Map, any casts, regex, declare/move, imports); tests (vitest unit tools/sub/factory/hooks/components, integration chat/credits/mcp, E2E open/send/mode/file/close/mcp/approval/status/mobile via playwright); docs (CLAUDE examples/pro-tips/caveats, README components/usage/features/accessibility/testing); PR prep.

## Changes/Files

**lib/mastra/**: agents (tersa-agent/reasoning/factory/index/instructions.xml), tools (canvas/workflow/analysis/search/index), workflows (node-generation/optimization/index), memory (supabase-adapter), mcp (index), index.ts.

**app/components/tersa-agent/**: chat/prompt-input/streaming/context-tags/mcp-config-modal, README.md.

**app/actions/agent/**: chat/canvas-operations/context.

**lib/hooks/**: use-tersa-agent/canvas-bridge/agent-context/mcp.

**lib/ai/**: workflow-parser.ts.

**schema.ts**: agent_memory/mcp_servers.

**command-menu.tsx**: Add "Configure MCP Tools"/Server/⌘⇧M.

**tests/**: vitest.config.ts/setup.ts, unit (hooks/components/lib/mcp), E2E (agent.spec.ts flows), playwright.config.ts.

**package.json**: Deps (@mastra/mcp, vitest/testing-library/react/hooks, vitejs/plugin-react, vitest/ui, happy-dom, playwright/test), scripts (test/ui/coverage/e2e/ui/all).

**CLAUDE.md**: Phases/examples/commands/advanced/MCP/context/pro-tips/impl/memory/tools/workflows/UI/custom/troubleshoot.

## Usage/Examples

- **Cmd-k "Ask Tersa Agent"/⌘⇧K**: Open chat, prompt "add text node"—streams, executes, animates.
- **"delete node"**: Approval Buttons, confirm executes/rollback.
- **Cmd-k "Configure MCP Tools"/⌘⇧M**: Modal add url/key, save—prompt uses dynamic tool.
- **Multi-user**: Action broadcasts, toast "[user] added node", apply real-time.

## Tests/Coverage

- **Vitest unit** (tools/sub/factory/hooks/components/mcp—mock execute/assert).
- **Integration** (chat/credits/mcp—mock supabase/agent).
- **E2E Playwright** (open/send/mode/file/close/mcp/approval/status/mobile—page.goto/prompt/assert added/approve/reject).
- Run `pnpm test/all`—coverage html/text.

## Caveats/Debt

- 6 workflow Zod mismatches (any casted—non-critical).
- Memory fallback in-memory on no DB (try/catch log/switch).
- Collab simulate (no multi-user E2E—manual).
- No voice (future).

Ready for review/merge—excited for feedback!