import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const analyzeWorkflowStep = createStep({
  id: 'analyze-workflow',
  inputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
  outputSchema: z.object({
    bottlenecks: z.array(z.object({
      nodeId: z.string(),
      issue: z.string(),
      impact: z.enum(['high', 'medium', 'low']),
    })),
    redundancies: z.array(z.object({
      nodeIds: z.array(z.string()),
      reason: z.string(),
    })),
    suggestions: z.array(z.object({
      type: z.string(),
      description: z.string(),
      nodeIds: z.array(z.string()).optional(),
    })),
  }),
  execute: async ({ inputData }) => {
    const { nodes, edges } = inputData;
    const bottlenecks = [];
    const redundancies = [];
    const suggestions = [];
    
    // Analyze for bottlenecks
    const nodeConnectionCount = new Map();
    edges.forEach((edge: any) => {
      nodeConnectionCount.set(edge.target, (nodeConnectionCount.get(edge.target) || 0) + 1);
    });
    
    // Find nodes with many incoming connections (potential bottlenecks)
    nodeConnectionCount.forEach((count, nodeId) => {
      if (count > 3) {
        bottlenecks.push({
          nodeId,
          issue: 'Multiple dependencies may cause delays',
          impact: count > 5 ? 'high' : 'medium',
        });
      }
    });
    
    // Find redundant transform nodes
    const transformNodes = nodes.filter((n: any) => n.type === 'transform');
    const modelGroups = new Map();
    
    transformNodes.forEach((node: any) => {
      const model = node.data?.model || 'unknown';
      if (!modelGroups.has(model)) {
        modelGroups.set(model, []);
      }
      modelGroups.get(model).push(node.id);
    });
    
    modelGroups.forEach((nodeIds, model) => {
      if (nodeIds.length > 1) {
        redundancies.push({
          nodeIds,
          reason: `Multiple ${model} transform nodes could be combined`,
        });
      }
    });
    
    // Generate suggestions
    if (bottlenecks.length > 0) {
      suggestions.push({
        type: 'parallelization',
        description: 'Consider parallelizing independent branches to reduce bottlenecks',
      });
    }
    
    if (redundancies.length > 0) {
      suggestions.push({
        type: 'consolidation',
        description: 'Combine similar transform nodes to reduce API calls and costs',
      });
    }
    
    // Check for missing error handling
    const hasErrorHandling = nodes.some((n: any) => 
      n.data?.content?.toLowerCase().includes('error') ||
      n.data?.label?.toLowerCase().includes('fallback')
    );
    
    if (!hasErrorHandling) {
      suggestions.push({
        type: 'error-handling',
        description: 'Add error handling nodes for better reliability',
      });
    }
    
    return { bottlenecks, redundancies, suggestions };
  },
});

const optimizeLayoutStep = createStep({
  id: 'optimize-layout',
  inputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    bottlenecks: z.array(z.any()),
    redundancies: z.array(z.any()),
  }),
  outputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    layoutChanges: z.array(z.object({
      nodeId: z.string(),
      oldPosition: z.object({ x: z.number(), y: z.number() }),
      newPosition: z.object({ x: z.number(), y: z.number() }),
    })),
  }),
  execute: async ({ inputData }) => {
    const { nodes, edges, bottlenecks } = inputData;
    const layoutChanges = [];
    
    // Create a copy of nodes to modify
    const optimizedNodes = nodes.map((n: any) => ({ ...n }));
    
    // Reposition bottleneck nodes to be more central
    bottlenecks.forEach((bottleneck: any) => {
      const node = optimizedNodes.find((n: any) => n.id === bottleneck.nodeId);
      if (node && bottleneck.impact === 'high') {
        const oldPosition = { ...node.position };
        
        // Move high-impact bottlenecks to more accessible positions
        node.position.y = 0; // Move to top row
        
        layoutChanges.push({
          nodeId: node.id,
          oldPosition,
          newPosition: node.position,
        });
      }
    });
    
    // Align parallel branches
    const levelMap = new Map();
    const visited = new Set();
    
    function assignLevels(nodeId: string, level: number) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      levelMap.set(nodeId, level);
      
      edges.forEach((edge: any) => {
        if (edge.source === nodeId) {
          assignLevels(edge.target, level + 1);
        }
      });
    }
    
    // Find root nodes (no incoming edges)
    const rootNodes = optimizedNodes.filter((node: any) => 
      !edges.some((edge: any) => edge.target === node.id)
    );
    
    rootNodes.forEach((root: any) => assignLevels(root.id, 0));
    
    // Reposition nodes based on levels
    const levelNodes = new Map();
    levelMap.forEach((level, nodeId) => {
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level).push(nodeId);
    });
    
    levelNodes.forEach((nodeIds, level) => {
      nodeIds.forEach((nodeId: string, index: number) => {
        const node = optimizedNodes.find((n: any) => n.id === nodeId);
        if (node) {
          const oldPosition = { ...node.position };
          node.position = {
            x: level * 250,
            y: index * 150,
          };
          
          if (oldPosition.x !== node.position.x || oldPosition.y !== node.position.y) {
            layoutChanges.push({
              nodeId,
              oldPosition,
              newPosition: node.position,
            });
          }
        }
      });
    });
    
    return {
      nodes: optimizedNodes,
      edges,
      layoutChanges,
    };
  },
});

const generateOptimizationReportStep = createStep({
  id: 'generate-report',
  inputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    bottlenecks: z.array(z.any()),
    redundancies: z.array(z.any()),
    suggestions: z.array(z.any()),
    layoutChanges: z.array(z.any()),
  }),
  outputSchema: z.object({
    report: z.object({
      summary: z.string(),
      optimizationsApplied: z.array(z.string()),
      estimatedImprovement: z.object({
        performance: z.string(),
        cost: z.string(),
        reliability: z.string(),
      }),
      nextSteps: z.array(z.string()),
    }),
    optimizedWorkflow: z.object({
      nodes: z.array(z.any()),
      edges: z.array(z.any()),
    }),
  }),
  execute: async ({ inputData }) => {
    const { nodes, edges, bottlenecks, redundancies, suggestions, layoutChanges } = inputData;
    
    const optimizationsApplied = [];
    
    if (layoutChanges.length > 0) {
      optimizationsApplied.push(`Repositioned ${layoutChanges.length} nodes for better flow`);
    }
    
    if (bottlenecks.length > 0) {
      optimizationsApplied.push(`Identified ${bottlenecks.length} potential bottlenecks`);
    }
    
    if (redundancies.length > 0) {
      optimizationsApplied.push(`Found ${redundancies.length} opportunities for consolidation`);
    }
    
    const report = {
      summary: `Workflow optimization complete. Found ${bottlenecks.length + redundancies.length} improvement opportunities.`,
      optimizationsApplied,
      estimatedImprovement: {
        performance: bottlenecks.length > 0 ? '20-30% faster execution' : 'No significant change',
        cost: redundancies.length > 0 ? '15-25% reduction in API costs' : 'No significant change',
        reliability: suggestions.some((s: any) => s.type === 'error-handling') ? 'Improved error resilience' : 'Already robust',
      },
      nextSteps: suggestions.map((s: any) => s.description),
    };
    
    return {
      report,
      optimizedWorkflow: { nodes, edges },
    };
  },
});

export const optimizationWorkflow = createWorkflow({
  id: 'optimize-workflow',
  description: 'Analyze and optimize existing workflows',
  inputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
  outputSchema: z.object({
    report: z.any(),
    optimizedWorkflow: z.object({
      nodes: z.array(z.any()),
      edges: z.array(z.any()),
    }),
  }),
})
.then(analyzeWorkflowStep)
.then(optimizeLayoutStep)
.then(generateOptimizationReportStep)
.commit();