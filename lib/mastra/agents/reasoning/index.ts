import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import * as fs from 'fs/promises';
import * as path from 'path';
import { analysisTools } from '../../tools/analysis-tools';
import { searchTools } from '../../tools/search-tools';

// Load instructions from XML file
const loadInstructions = async () => {
  try {
    const instructionsPath = path.join(__dirname, 'instructions.xml');
    const content = await fs.readFile(instructionsPath, 'utf-8');
    return content;
  } catch (error) {
    console.warn('Failed to load reasoning agent instructions, using fallback');
    return `
      You are a reasoning sub-agent specialized in breaking down complex requests,
      analyzing workflow requirements, and providing structured recommendations.
      Think step-by-step and provide clear, actionable guidance.
    `;
  }
};

export const createReasoningAgent = (memory: Memory) => {
  return new Agent({
    name: 'ReasoningSub',
    instructions: async ({ runtimeContext }) => {
      const baseInstructions = await loadInstructions();
      const currentGoal = runtimeContext?.get('current-goal') || '';
      const canvasState = runtimeContext?.get('canvas-state') || {};
      
      return `
        ${baseInstructions}
        
        Current context:
        - Goal: ${currentGoal}
        - Canvas nodes: ${Object.keys(canvasState.nodes || {}).length}
        - Canvas edges: ${Object.keys(canvasState.edges || {}).length}
        
        Focus on providing deep analysis and structured reasoning for complex workflows.
      `;
    },
    model: ({ runtimeContext }) => {
      const modelPreference = runtimeContext?.get('model-preference');
      
      // Use deeper models for reasoning tasks
      if (modelPreference === 'quality' || modelPreference === 'balanced') {
        return anthropic('claude-3-opus-20240229');
      } else if (modelPreference === 'fast') {
        return openai('gpt-4o-mini');
      }
      // Default to a model good at reasoning
      return openai('gpt-4o');
    },
    memory, // Share memory with main agent
    tools: {
      ...analysisTools,
      ...searchTools,
      // Tool to format structured recommendations
      formatWorkflowRecommendation: {
        description: 'Format a structured workflow recommendation with nodes and connections',
        parameters: {
          nodes: { type: 'array', description: 'List of nodes to create' },
          connections: { type: 'array', description: 'List of connections between nodes' },
          reasoning: { type: 'string', description: 'Explanation of the design choices' },
        },
        execute: async ({ nodes, connections, reasoning }) => {
          return {
            recommendation: {
              nodes,
              connections,
              reasoning,
              formatted: true,
            },
          };
        },
      },
    },
    maxSteps: 5, // Reasoning should be focused
  });
};