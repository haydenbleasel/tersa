import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const analyzeWorkflowTool = createTool({
  id: 'analyze-workflow',
  description: 'Analyze a workflow for performance, cost, and optimization opportunities',
  inputSchema: z.object({
    includeMetrics: z.array(z.enum(['performance', 'cost', 'complexity', 'reliability'])).optional(),
  }),
  outputSchema: z.object({
    metrics: z.object({
      nodeCount: z.number(),
      edgeCount: z.number(),
      estimatedExecutionTime: z.number().optional(),
      estimatedCost: z.number().optional(),
      complexityScore: z.number().optional(),
      reliabilityScore: z.number().optional(),
    }),
    issues: z.array(z.object({
      type: z.enum(['warning', 'error', 'suggestion']),
      nodeId: z.string().optional(),
      message: z.string(),
    })),
    optimizations: z.array(z.object({
      type: z.string(),
      description: z.string(),
      impact: z.enum(['high', 'medium', 'low']),
    })),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const analysis = await canvasApi.analyzeWorkflow(context);
    
    return analysis;
  },
});

export const getNodeStatsTool = createTool({
  id: 'get-node-stats',
  description: 'Get execution statistics for specific nodes',
  inputSchema: z.object({
    nodeIds: z.array(z.string()).optional(),
    timeRange: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
  }),
  outputSchema: z.object({
    stats: z.array(z.object({
      nodeId: z.string(),
      executionCount: z.number(),
      averageExecutionTime: z.number(),
      successRate: z.number(),
      lastExecuted: z.string().optional(),
      errors: z.array(z.object({
        timestamp: z.string(),
        message: z.string(),
      })).optional(),
    })),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const stats = await canvasApi.getNodeStats(context);
    
    return { stats };
  },
});

export const detectBottlenecksTool = createTool({
  id: 'detect-bottlenecks',
  description: 'Identify performance bottlenecks in the workflow',
  inputSchema: z.object({
    threshold: z.number().optional().describe('Time threshold in ms to consider as bottleneck'),
  }),
  outputSchema: z.object({
    bottlenecks: z.array(z.object({
      nodeId: z.string(),
      averageTime: z.number(),
      impact: z.enum(['critical', 'high', 'medium', 'low']),
      suggestions: z.array(z.string()),
    })),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const bottlenecks = await canvasApi.detectBottlenecks({
      threshold: context.threshold || 1000,
    });
    
    return { bottlenecks };
  },
});

export const suggestModelsTool = createTool({
  id: 'suggest-models',
  description: 'Suggest optimal AI models for transform nodes based on use case',
  inputSchema: z.object({
    nodeId: z.string(),
    optimizeFor: z.enum(['speed', 'quality', 'cost', 'balanced']).default('balanced'),
  }),
  outputSchema: z.object({
    currentModel: z.string(),
    suggestions: z.array(z.object({
      model: z.string(),
      provider: z.string(),
      reasoning: z.string(),
      tradeoffs: z.object({
        speed: z.enum(['faster', 'similar', 'slower']),
        quality: z.enum(['better', 'similar', 'worse']),
        cost: z.enum(['cheaper', 'similar', 'expensive']),
      }),
    })),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const suggestions = await canvasApi.suggestModels(context);
    
    return suggestions;
  },
});

export const validateWorkflowTool = createTool({
  id: 'validate-workflow',
  description: 'Validate workflow for completeness and correctness',
  inputSchema: z.object({
    strict: z.boolean().default(false),
  }),
  outputSchema: z.object({
    valid: z.boolean(),
    errors: z.array(z.object({
      nodeId: z.string().optional(),
      edgeId: z.string().optional(),
      type: z.string(),
      message: z.string(),
    })),
    warnings: z.array(z.object({
      nodeId: z.string().optional(),
      edgeId: z.string().optional(),
      type: z.string(),
      message: z.string(),
    })),
  }),
  execute: async ({ context, runtimeContext }: { context: any; runtimeContext: any }) => {
    const canvasApi = runtimeContext?.get('canvas-api') as any;
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const validation = await canvasApi.validateWorkflow(context);
    
    return validation;
  },
});