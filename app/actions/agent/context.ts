'use server';

import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import type { Node, Edge } from '@xyflow/react';

export async function getCanvasContext(projectId: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const project = await database
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .then(res => res[0]);

  if (!project || project.userId !== user.id) {
    throw new Error('Project not found');
  }

  const content = project.content as { nodes: Node[]; edges: Edge[] } || { nodes: [], edges: [] };

  return {
    projectName: project.name,
    nodes: content.nodes,
    edges: content.edges,
    nodeCount: content.nodes.length,
    edgeCount: content.edges.length,
    nodeTypes: [...new Set(content.nodes.map(n => n.type))],
  };
}

export async function getRecentActions(projectId: string, limit = 10) {
  // In a real implementation, this would query an actions log table
  // For now, we'll return mock data
  return [
    { action: 'node_added', timestamp: new Date(), details: { type: 'text' } },
    { action: 'nodes_connected', timestamp: new Date(), details: { source: 'node1', target: 'node2' } },
  ];
}

export function serializeCanvasState(nodes: Node[], edges: Edge[]) {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };
}