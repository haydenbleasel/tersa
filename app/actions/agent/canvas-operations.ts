'use server';

import { currentUser } from '@/lib/auth';
import { updateProjectAction } from '@/app/actions/project/update';
import { parseError } from '@/lib/error/parse';
import { database } from '@/lib/database';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import type { Node, Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';

export async function addNodeToCanvas(
  projectId: string,
  nodeData: {
    type: string;
    position?: { x: number; y: number };
    data: any;
  }
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get current project content
    const { content } = await database
      .select({ content: projects.content })
      .from(projects)
      .where(eq(projects.id, projectId))
      .then(res => res[0] || { content: { nodes: [], edges: [] } });

    const currentContent = content as { nodes: Node[]; edges: Edge[] } || { nodes: [], edges: [] };

    // Create new node
    const newNode: Node = {
      id: nanoid(),
      type: nodeData.type,
      position: nodeData.position || {
        x: 100 + currentContent.nodes.length * 50,
        y: 100 + currentContent.nodes.length * 50,
      },
      data: nodeData.data,
    };

    // Update content
    const updatedContent = {
      nodes: [...currentContent.nodes, newNode],
      edges: currentContent.edges,
    };

    await updateProjectAction(projectId, { content: updatedContent });

    return { nodeId: newNode.id, success: true };
  } catch (error) {
    const message = parseError(error);
    return { error: message };
  }
}

export async function connectNodesInCanvas(
  projectId: string,
  connectionData: {
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle?: string;
    targetHandle?: string;
  }
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get current project content
    const { content } = await database
      .select({ content: projects.content })
      .from(projects)
      .where(eq(projects.id, projectId))
      .then(res => res[0] || { content: { nodes: [], edges: [] } });

    const currentContent = content as { nodes: Node[]; edges: Edge[] } || { nodes: [], edges: [] };

    // Create new edge
    const newEdge: Edge = {
      id: nanoid(),
      source: connectionData.sourceNodeId,
      target: connectionData.targetNodeId,
      sourceHandle: connectionData.sourceHandle,
      targetHandle: connectionData.targetHandle,
      type: 'animated',
    };

    // Update content
    const updatedContent = {
      nodes: currentContent.nodes,
      edges: [...currentContent.edges, newEdge],
    };

    await updateProjectAction(projectId, { content: updatedContent });

    return { edgeId: newEdge.id, success: true };
  } catch (error) {
    const message = parseError(error);
    return { error: message };
  }
}

export async function updateNodeInCanvas(
  projectId: string,
  nodeId: string,
  updates: Partial<Node>
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get current project content
    const { content } = await database
      .select({ content: projects.content })
      .from(projects)
      .where(eq(projects.id, projectId))
      .then(res => res[0] || { content: { nodes: [], edges: [] } });

    const currentContent = content as { nodes: Node[]; edges: Edge[] } || { nodes: [], edges: [] };

    // Update node
    const updatedNodes = currentContent.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          ...updates,
          data: { ...node.data, ...updates.data },
        };
      }
      return node;
    });

    // Update content
    const updatedContent = {
      nodes: updatedNodes,
      edges: currentContent.edges,
    };

    await updateProjectAction(projectId, { content: updatedContent });

    return { success: true };
  } catch (error) {
    const message = parseError(error);
    return { error: message };
  }
}

export async function deleteNodeFromCanvas(
  projectId: string,
  nodeId: string
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get current project content
    const { content } = await database
      .select({ content: projects.content })
      .from(projects)
      .where(eq(projects.id, projectId))
      .then(res => res[0] || { content: { nodes: [], edges: [] } });

    const currentContent = content as { nodes: Node[]; edges: Edge[] } || { nodes: [], edges: [] };

    // Remove node and related edges
    const updatedNodes = currentContent.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = currentContent.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    );

    // Update content
    const updatedContent = {
      nodes: updatedNodes,
      edges: updatedEdges,
    };

    await updateProjectAction(projectId, { content: updatedContent });

    return { success: true };
  } catch (error) {
    const message = parseError(error);
    return { error: message };
  }
}