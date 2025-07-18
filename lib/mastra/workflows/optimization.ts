import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  WorkflowNodeSchema,
  WorkflowEdgeSchema,
  BottleneckSchema,
  RedundancySchema,
  SuggestionSchema,
  LayoutChangeSchema,
} from './types';
import type {
  WorkflowNode,
  WorkflowEdge,
  Bottleneck,
  Redundancy,
  Suggestion,
  LayoutChange,
} from './types';

const analyzeWorkflowStep = createStep({
  id: 'analyze-workflow',
  inputSchema: z.object({
    nodes: z.array(WorkflowNodeSchema),
    edges: z.array(WorkflowEdgeSchema),
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
    const bottlenecks: Bottleneck[] = [];
    const redundancies: Redundancy[] = [];
    const suggestions: Suggestion[] = [];
    
    // Analyze for bottlenecks
    const nodeConnectionCount = new Map();
    edges.forEach((edge) => {
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
    
    // Find redundant AI model usage patterns
    const transformNodes = nodes.filter((n) => n.type.includes('transform'));
    const modelGroups = new Map();
    
    transformNodes.forEach((node) => {
      const model = node.data?.model || 'unknown';
      if (!modelGroups.has(model)) {
        modelGroups.set(model, []);
      }
      modelGroups.get(model).push(node.id);
    });
    
    // Check for redundant model usage that could be combined
    modelGroups.forEach((nodeIds, model) => {
      if (nodeIds.length > 1) {
        // Check if these nodes could potentially be combined
        const nodesCanBeCombined = nodeIds.every((nodeId) => {
          const node = nodes.find((n) => n.id === nodeId);
          const incomingEdges = edges.filter((e) => e.target === nodeId);
          // Can combine if nodes have similar input patterns
          return node && incomingEdges.length <= 2;
        });
        
        if (nodesCanBeCombined) {
          redundancies.push({
            nodeIds,
            reason: `Multiple ${model} transform nodes processing similar inputs could be combined to reduce API costs`,
          });
        }
      }
    });
    
    // Check for expensive model usage where cheaper alternatives might work
    const expensiveModels = ['gpt-4', 'claude-4-opus', 'o1'];
    nodes.forEach((node) => {
      if (node.data?.model && expensiveModels.includes(node.data.model)) {
        const hasSimpleTask = node.data?.instructions?.length < 100 || 
                             node.data?.instructions?.toLowerCase().includes('summarize') ||
                             node.data?.instructions?.toLowerCase().includes('classify');
        if (hasSimpleTask) {
          suggestions.push({
            type: 'cost-optimization',
            description: `Consider using a cheaper model like GPT-4o-mini or Claude Haiku for simple tasks`,
            nodeIds: [node.id],
          });
        }
      }
    });
    
    // Generate AI-specific suggestions
    if (bottlenecks.length > 0) {
      suggestions.push({
        type: 'parallelization',
        description: 'Consider parallelizing independent AI model calls to reduce latency',
      });
    }
    
    if (redundancies.length > 0) {
      suggestions.push({
        type: 'consolidation',
        description: 'Combine similar transform nodes to reduce API calls and costs',
      });
    }
    
    // Check for multimodal optimization opportunities
    const hasMultimodalNodes = nodes.some((n) => 
      n.type === 'image/transform' || n.type === 'audio/transform' || n.type === 'video/transform'
    );
    const hasTextNodes = nodes.some((n) => n.type === 'text/transform');
    
    if (hasMultimodalNodes && hasTextNodes) {
      suggestions.push({
        type: 'multimodal-optimization',
        description: 'Consider using models with native multimodal support (e.g., GPT-4o, Gemini) for better integration',
      });
    }
    
    // Check for missing validation
    const hasValidation = nodes.some((n) => 
      n.data?.instructions?.toLowerCase().includes('validate') ||
      n.data?.instructions?.toLowerCase().includes('check') ||
      n.data?.label?.toLowerCase().includes('validation')
    );
    
    if (!hasValidation && nodes.length > 3) {
      suggestions.push({
        type: 'validation',
        description: 'Add validation nodes to ensure output quality, especially for critical workflows',
      });
    }
    
    // Check for prompt optimization
    const longPrompts = nodes.filter((n) => 
      n.data?.instructions?.length > 500 || n.data?.content?.length > 500
    );
    
    if (longPrompts.length > 0) {
      suggestions.push({
        type: 'prompt-optimization',
        description: 'Consider breaking down long prompts into smaller, focused instructions for better results',
        nodeIds: longPrompts.map((n) => n.id),
      });
    }
    
    return { bottlenecks, redundancies, suggestions };
  },
});

const optimizeLayoutStep = createStep({
  id: 'optimize-layout',
  inputSchema: z.object({
    nodes: z.array(WorkflowNodeSchema),
    edges: z.array(WorkflowEdgeSchema),
    bottlenecks: z.array(BottleneckSchema),
    redundancies: z.array(RedundancySchema),
  }),
  outputSchema: z.object({
    nodes: z.array(WorkflowNodeSchema),
    edges: z.array(WorkflowEdgeSchema),
    layoutChanges: z.array(LayoutChangeSchema),
  }),
  execute: async ({ inputData }) => {
    const { nodes, edges, bottlenecks } = inputData;
    const layoutChanges: LayoutChange[] = [];
    
    // Create a copy of nodes to modify
    const optimizedNodes = nodes.map((n) => ({ ...n }));
    
    // Group related AI nodes together for better organization
    const nodeTypeGroups = new Map();
    optimizedNodes.forEach((node) => {
      const baseType = node.type.split('/')[0]; // e.g., 'text', 'image', 'audio'
      if (!nodeTypeGroups.has(baseType)) {
        nodeTypeGroups.set(baseType, []);
      }
      nodeTypeGroups.get(baseType).push(node);
    });
    
    // Position bottleneck nodes strategically
    bottlenecks.forEach((bottleneck) => {
      const node = optimizedNodes.find((n) => n.id === bottleneck.nodeId);
      if (node && bottleneck.impact === 'high') {
        const oldPosition = { ...node.position };
        
        // High-impact nodes should be easily accessible
        const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
        if (connectedEdges.length > 4) {
          // Central position for highly connected nodes
          node.position.x = 400;
          node.position.y = 200;
        }
        
        if (oldPosition.x !== node.position.x || oldPosition.y !== node.position.y) {
          layoutChanges.push({
            nodeId: node.id,
            oldPosition,
            newPosition: node.position,
          });
        }
      }
    });
    
    // Align parallel branches
    const levelMap = new Map();
    const visited = new Set();
    
    function assignLevels(nodeId: string, level: number) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      levelMap.set(nodeId, level);
      
      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          assignLevels(edge.target, level + 1);
        }
      });
    }
    
    // Find root nodes (no incoming edges)
    const rootNodes = optimizedNodes.filter((node) => 
      !edges.some((edge) => edge.target === node.id)
    );
    
    rootNodes.forEach((root) => assignLevels(root.id, 0));
    
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
        const node = optimizedNodes.find((n) => n.id === nodeId);
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
    nodes: z.array(WorkflowNodeSchema),
    edges: z.array(WorkflowEdgeSchema),
    bottlenecks: z.array(BottleneckSchema),
    redundancies: z.array(RedundancySchema),
    suggestions: z.array(SuggestionSchema),
    layoutChanges: z.array(LayoutChangeSchema),
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
      nodes: z.array(WorkflowNodeSchema),
      edges: z.array(WorkflowEdgeSchema),
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
        performance: bottlenecks.length > 0 ? '20-30% faster execution through parallel API calls' : 'No significant latency improvements',
        cost: redundancies.length > 0 ? '15-25% reduction in API costs through consolidation' : 'Already cost-optimized',
        reliability: suggestions.some((s) => s.type === 'validation') ? 'Improved output quality with validation' : 'Current reliability maintained',
      },
      nextSteps: suggestions.map((s) => s.description),
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
      nodes: z.array(WorkflowNodeSchema),
      edges: z.array(WorkflowEdgeSchema),
    }),
  }),
})
.then(analyzeWorkflowStep)
.then(optimizeLayoutStep)
.then(generateOptimizationReportStep)
.commit();