import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const addNodeTool = createTool({
  id: 'add-node',
  description: 'Add a new node to the canvas',
  inputSchema: z.object({
    type: z.enum(['text', 'image', 'audio', 'video', 'code', 'tweet', 'transform']),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }).optional(),
    data: z.object({
      label: z.string(),
      content: z.string().optional(),
      model: z.string().optional(),
    }),
  }),
  outputSchema: z.object({
    nodeId: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const newNode = await canvasApi.addNode({
      type: context.type,
      position: context.position || canvasApi.getNextPosition(),
      data: context.data,
    });
    
    return {
      nodeId: newNode.id,
      success: true,
    };
  },
});

export const connectNodesTool = createTool({
  id: 'connect-nodes',
  description: 'Create a connection between two nodes',
  inputSchema: z.object({
    sourceNodeId: z.string(),
    sourceHandle: z.string().optional(),
    targetNodeId: z.string(),
    targetHandle: z.string().optional(),
  }),
  outputSchema: z.object({
    edgeId: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const edge = await canvasApi.connectNodes(context);
    
    return {
      edgeId: edge.id,
      success: true,
    };
  },
});

export const updateNodeTool = createTool({
  id: 'update-node',
  description: 'Update an existing node\'s properties',
  inputSchema: z.object({
    nodeId: z.string(),
    updates: z.object({
      label: z.string().optional(),
      content: z.string().optional(),
      model: z.string().optional(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }).optional(),
    }),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    await canvasApi.updateNode(context.nodeId, context.updates);
    
    return { success: true };
  },
});

export const deleteNodeTool = createTool({
  id: 'delete-node',
  description: 'Delete a node from the canvas',
  needsConfirm: true,
  inputSchema: z.object({
    nodeId: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    await canvasApi.deleteNode(context.nodeId);
    
    return { success: true };
  },
} as any);

export const deleteEdgeTool = createTool({
  id: 'delete-edge',
  description: 'Delete a connection between nodes',
  needsConfirm: true,
  inputSchema: z.object({
    edgeId: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    await canvasApi.deleteEdge(context.edgeId);
    
    return { success: true };
  },
} as any);

export const getCanvasStateTool = createTool({
  id: 'get-canvas-state',
  description: 'Get the current state of the canvas including all nodes and edges',
  inputSchema: z.object({}),
  outputSchema: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      data: z.any(),
    })),
    edges: z.array(z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
      targetHandle: z.string().optional(),
    })),
  }),
  execute: async ({ runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const state = await canvasApi.getCanvasState();
    
    return state;
  },
});

export const layoutNodesTool = createTool({
  id: 'layout-nodes',
  description: 'Automatically arrange nodes in a clean layout',
  inputSchema: z.object({
    layoutType: z.enum(['horizontal', 'vertical', 'dagre', 'elk']).default('dagre'),
    nodeSpacing: z.number().optional(),
    rankSpacing: z.number().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    await canvasApi.layoutNodes(context);
    
    return { success: true };
  },
});

export const rollbackLastTool = createTool({
  id: 'rollback-last',
  description: 'Rollback the last canvas operation to the previous state',
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    
    if (!canvasApi) throw new Error('Canvas API not available');
    
    try {
      // Get the last state from canvas history
      const lastState = await canvasApi.getLastState();
      
      if (!lastState) {
        return {
          success: false,
          message: 'No previous state found to rollback to',
        };
      }
      
      // Apply the previous state
      await canvasApi.applyState(lastState);
      
      return {
        success: true,
        message: 'Successfully rolled back to previous state',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to rollback: ${(error as Error).message}`,
      };
    }
  },
});