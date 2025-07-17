import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const executeWorkflowTool = createTool({
  id: 'execute-workflow',
  description: 'Execute a workflow on the canvas',
  inputSchema: z.object({
    startNodeId: z.string().optional(),
    parameters: z.record(z.any()).optional(),
  }),
  outputSchema: z.object({
    result: z.any(),
    executionTime: z.number(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api');
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const startTime = Date.now();
    const result = await canvasApi.executeWorkflow({
      startNodeId: context.startNodeId,
      parameters: context.parameters,
    });
    
    return {
      result,
      executionTime: Date.now() - startTime,
      success: true,
    };
  },
});

export const saveWorkflowTool = createTool({
  id: 'save-workflow',
  description: 'Save the current workflow',
  inputSchema: z.object({
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    workflowId: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api');
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const workflow = await canvasApi.saveWorkflow(context);
    
    return {
      workflowId: workflow.id,
      success: true,
    };
  },
});

export const loadWorkflowTool = createTool({
  id: 'load-workflow',
  description: 'Load a saved workflow onto the canvas',
  inputSchema: z.object({
    workflowId: z.string(),
    clearCanvas: z.boolean().default(true),
  }),
  outputSchema: z.object({
    nodesLoaded: z.number(),
    edgesLoaded: z.number(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api');
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const result = await canvasApi.loadWorkflow({
      workflowId: context.workflowId,
      clearCanvas: context.clearCanvas,
    });
    
    return {
      nodesLoaded: result.nodes.length,
      edgesLoaded: result.edges.length,
      success: true,
    };
  },
});

export const duplicateWorkflowTool = createTool({
  id: 'duplicate-workflow',
  description: 'Duplicate an existing workflow',
  inputSchema: z.object({
    sourceWorkflowId: z.string(),
    newName: z.string(),
  }),
  outputSchema: z.object({
    newWorkflowId: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api');
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const newWorkflow = await canvasApi.duplicateWorkflow(context);
    
    return {
      newWorkflowId: newWorkflow.id,
      success: true,
    };
  },
});

export const exportWorkflowTool = createTool({
  id: 'export-workflow',
  description: 'Export workflow to various formats',
  inputSchema: z.object({
    format: z.enum(['json', 'yaml', 'python', 'javascript']),
    includeCredentials: z.boolean().default(false),
  }),
  outputSchema: z.object({
    exportedContent: z.string(),
    format: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api');
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const exported = await canvasApi.exportWorkflow(context);
    
    return {
      exportedContent: exported.content,
      format: context.format,
      success: true,
    };
  },
});