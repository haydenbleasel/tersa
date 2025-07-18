import { z } from 'zod';

// Node schema for workflows
export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string().optional(),
    content: z.string().optional(),
    model: z.string().optional(),
  }).passthrough(), // Allow additional properties
});
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;

// Edge schema for workflows
export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});
export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;

// Bottleneck schema
export const BottleneckSchema = z.object({
  nodeId: z.string(),
  issue: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
});
export type Bottleneck = z.infer<typeof BottleneckSchema>;

// Redundancy schema
export const RedundancySchema = z.object({
  nodeIds: z.array(z.string()),
  reason: z.string(),
});
export type Redundancy = z.infer<typeof RedundancySchema>;

// Suggestion schema
export const SuggestionSchema = z.object({
  type: z.string(),
  description: z.string(),
  nodeIds: z.array(z.string()).optional(),
});
export type Suggestion = z.infer<typeof SuggestionSchema>;

// Layout change schema
export const LayoutChangeSchema = z.object({
  nodeId: z.string(),
  oldPosition: z.object({
    x: z.number(),
    y: z.number(),
  }),
  newPosition: z.object({
    x: z.number(),
    y: z.number(),
  }),
});
export type LayoutChange = z.infer<typeof LayoutChangeSchema>;