import { z } from 'zod';

// Node types
export const NodeTypeSchema = z.enum(['text', 'image', 'audio', 'video', 'code', 'tweet', 'transform']);
export type NodeType = z.infer<typeof NodeTypeSchema>;

// Position schema
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

// Node data schema
export const NodeDataSchema = z.object({
  label: z.string(),
  content: z.string().optional(),
  model: z.string().optional(),
});
export type NodeData = z.infer<typeof NodeDataSchema>;

// Add node context
export const AddNodeContextSchema = z.object({
  type: NodeTypeSchema,
  position: PositionSchema.optional(),
  data: NodeDataSchema,
});
export type AddNodeContext = z.infer<typeof AddNodeContextSchema>;

// Connect nodes context
export const ConnectNodesContextSchema = z.object({
  sourceNodeId: z.string(),
  sourceHandle: z.string().optional(),
  targetNodeId: z.string(),
  targetHandle: z.string().optional(),
});
export type ConnectNodesContext = z.infer<typeof ConnectNodesContextSchema>;

// Update node context
export const UpdateNodeContextSchema = z.object({
  nodeId: z.string(),
  updates: z.object({
    label: z.string().optional(),
    content: z.string().optional(),
    model: z.string().optional(),
    position: PositionSchema.optional(),
  }),
});
export type UpdateNodeContext = z.infer<typeof UpdateNodeContextSchema>;

// Delete node context
export const DeleteNodeContextSchema = z.object({
  nodeId: z.string(),
});
export type DeleteNodeContext = z.infer<typeof DeleteNodeContextSchema>;

// Delete edge context
export const DeleteEdgeContextSchema = z.object({
  edgeId: z.string(),
});
export type DeleteEdgeContext = z.infer<typeof DeleteEdgeContextSchema>;

// Layout context
export const LayoutNodesContextSchema = z.object({
  type: z.enum(['horizontal', 'vertical', 'radial', 'grid']).optional(),
  spacing: z.number().optional(),
  animate: z.boolean().optional(),
});
export type LayoutNodesContext = z.infer<typeof LayoutNodesContextSchema>;

// Canvas API interface
export interface CanvasApi {
  addNode: (node: Omit<AddNodeContext, 'position'> & { position: Position }) => Promise<{ id: string }>;
  connectNodes: (connection: ConnectNodesContext) => Promise<{ id: string }>;
  updateNode: (nodeId: string, updates: UpdateNodeContext['updates']) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  deleteEdge: (edgeId: string) => Promise<void>;
  layoutNodes: (options: LayoutNodesContext) => Promise<void>;
  getCanvasState: () => Promise<{ nodes: any[]; edges: any[] }>;
  getNextPosition: () => Position;
  getCanvasHistory: () => any[];
  applyState: (state: any) => Promise<void>;
}

// Runtime context type
export type RuntimeContext = Map<string, any>;