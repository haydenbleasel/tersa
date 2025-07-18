import { Mastra } from '@mastra/core';
import { tersaAgent } from './agents/tersa-agent';
import * as canvasTools from './tools/canvas-tools';
import * as workflowTools from './tools/workflow-tools';
import * as analysisTools from './tools/analysis-tools';
import * as searchTools from './tools/search-tools';
import { nodeGenerationWorkflow } from './workflows/node-generation';
import { optimizationWorkflow } from './workflows/optimization';

// Export all tools for easy access
export const tools = {
  ...canvasTools,
  ...workflowTools,
  ...analysisTools,
  ...searchTools,
};

// Export all workflows
export const workflows = {
  nodeGeneration: nodeGenerationWorkflow,
  optimization: optimizationWorkflow,
};

// Create the Mastra instance with agents and workflows
export const mastra = new Mastra({
  agents: {
    tersaAgent,
  },
  workflows,
});

// Export the agent for direct access
export { tersaAgent };