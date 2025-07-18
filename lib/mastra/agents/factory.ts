import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { SupabaseMemoryAdapter } from '../memory/supabase-adapter';
import { createReasoningAgent } from './reasoning';
import { getDynamicTools } from '../mcp';
import * as tools from '../tools';

export interface AgentFactory {
  mainAgent: Agent;
  reasoningAgent: Agent;
  memory: Memory;
}

export function createTersaAgents(userId: string): AgentFactory {
  // Create user-specific memory with Supabase adapter
  const memory = new Memory({
    storage: new SupabaseMemoryAdapter(userId),
    options: {
      lastMessages: 30,
      semanticRecall: {
        topK: 5,
        messageRange: { before: 3, after: 2 },
      },
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: `
          # User Profile
          - Name: {{userName}}
          - Preferred AI Models: {{preferredModels}}
          - Workflow Style: {{workflowStyle}}
          
          # Current Canvas State
          - Active Nodes: {{activeNodes}}
          - Selected Elements: {{selectedElements}}
          - Recent Actions: {{recentActions}}
          
          # Session Context
          - Current Goal: {{currentGoal}}
          - Project Type: {{projectType}}
        `,
      },
    },
  });

  // Create reasoning sub-agent
  const reasoningAgent = createReasoningAgent(memory);

  // Create main agent with sub-agent support
  const mainAgent = new Agent({
    name: 'Tersa Agent',
    instructions: ({ runtimeContext }) => {
      const userTier = runtimeContext?.get('user-tier') || 'basic';
      const canvasState = runtimeContext?.get('canvas-state') || {};
      
      return `
        You are Tersa, an intelligent AI assistant for the Tersa visual workflow builder.
        
        Your capabilities include:
        - Creating, modifying, and deleting nodes on the canvas
        - Connecting nodes to build workflows
        - Analyzing and optimizing existing workflows
        - Generating complete workflows from natural language descriptions
        - Providing contextual help and suggestions
        - Delegating complex reasoning tasks to specialized sub-agents
        
        For complex workflow design or multi-step reasoning tasks, use the delegateToReasoning tool
        to get detailed analysis and structured recommendations.
        
        Current canvas state: ${JSON.stringify(canvasState)}
        User tier: ${userTier}
        
        Always maintain awareness of the visual canvas and provide clear, actionable responses.
        When manipulating the canvas, describe what you're doing visually.
      `;
    },
    model: ({ runtimeContext }) => {
      const modelPreference = runtimeContext?.get('model-preference');
      const userTier = runtimeContext?.get('user-tier');
      
      if (userTier === 'pro' && modelPreference === 'anthropic') {
        return anthropic('claude-3-opus-20240229');
      } else if (modelPreference === 'fast') {
        return openai('gpt-4o-mini');
      }
      return openai('gpt-4o');
    },
    memory,
    tools: async ({ runtimeContext }) => {
      const userTier = runtimeContext?.get('user-tier');
      const baseTools = {
        ...tools.canvasTools,
        ...tools.searchTools,
        // Add sub-agent delegation tool
        delegateToReasoning: {
          description: 'Delegate complex reasoning tasks to the reasoning sub-agent',
          parameters: {
            prompt: { type: 'string', description: 'The complex task or question to analyze' },
            context: { type: 'object', description: 'Additional context for the reasoning agent' },
          },
          execute: async ({ prompt, context }: { prompt: string; context?: Record<string, unknown> }) => {
            // Execute the reasoning agent with the same runtime context
            const combinedContext = new Map<string, unknown>([
              ...(runtimeContext as Map<string, unknown>).entries(),
              ...Object.entries(context || {}),
            ]);
            
            const result = await reasoningAgent.generate(prompt, {
              runtimeContext: combinedContext,
            });
            
            // Extract reasoning from the response
            let reasoning = '';
            let structured = null;
            
            if (result && 'messages' in result) {
              const messages = result.messages as Array<{ role: string; content: string }>;
              reasoning = messages
                .filter((m) => m.role === 'assistant')
                .map((m) => m.content)
                .join('\n');
            }
            
            if (result && 'toolCalls' in result) {
              const toolCalls = result.toolCalls as Array<{ toolName: string; args: unknown }>;
              const recommendation = toolCalls.find((tc) => tc.toolName === 'formatWorkflowRecommendation');
              if (recommendation) {
                structured = recommendation.args;
              }
            }
            
            return {
              reasoning,
              structured,
            };
          },
        },
      };
      
      let allTools = baseTools;
      
      if (userTier === 'pro') {
        allTools = {
          ...baseTools,
          ...tools.workflowTools,
          ...tools.analysisTools,
        };
      }
      
      // Add dynamic MCP tools
      return await getDynamicTools(allTools, runtimeContext as Map<string, unknown>);
    },
  });

  return {
    mainAgent,
    reasoningAgent,
    memory,
  };
}

// Backward compatibility wrapper
export function createTersaAgent(userId: string): Agent {
  const { mainAgent } = createTersaAgents(userId);
  return mainAgent;
}