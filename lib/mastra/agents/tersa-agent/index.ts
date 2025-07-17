import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import * as tools from '../../tools';

// Configure memory with LibSQL storage
const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.TERSA_AGENT_MEMORY_URL || 'file:./tersa-agent-memory.db',
  }),
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

export const tersaAgent = new Agent({
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
  tools: ({ runtimeContext }) => {
    const userTier = runtimeContext?.get('user-tier');
    const baseTools = {
      ...tools.canvasTools,
      ...tools.searchTools,
    };
    
    if (userTier === 'pro') {
      return {
        ...baseTools,
        ...tools.workflowTools,
        ...tools.analysisTools,
      };
    }
    
    return baseTools;
  },
  maxSteps: 10,
});