import { createClient } from '@/lib/supabase/client';
import SupabaseProvider from '@/lib/supabase/y-supabase';
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';

const supabase = createClient();

type CollaborationProps = {
  id: string;
  members: string[] | null;
  content?: {
    nodes: Node[];
    edges: Edge[];
  };
};

type CollaborationReturn = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<Node>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  removeDropNodes: () => void;
};

// Custom hook for Y.js functionality
export const useCollaboration = (
  data: CollaborationProps,
  save: () => void
): CollaborationReturn => {
  const yDoc = useRef<Y.Doc | null>(null);
  const yNodes = useRef<Y.Array<Node> | null>(null);
  const yEdges = useRef<Y.Array<Edge> | null>(null);
  const [nodes, setNodes] = useState<Node[]>(data.content?.nodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(data.content?.edges ?? []);

  useEffect(() => {
    if (!data.members?.length) {
      return;
    }

    // Create a new Y.Doc (CRDT document)
    const ydoc = new Y.Doc();

    // Connect peers using SupabaseProvider for sync.
    const provider = new SupabaseProvider(ydoc, supabase, {
      channel: `${data.id}-canvas`,
      id: data.id,
      resyncInterval: 5000, // Optional
      columnName: 'content',
      tableName: 'project',
    });

    provider.on('save', () => {
      save();
    });

    // Create shared arrays for nodes and edges (initially empty)
    yNodes.current = ydoc.getArray<Node>('nodes');
    yEdges.current = ydoc.getArray<Edge>('edges');

    // Initialize with existing content if available
    if (data.content && yNodes.current && yEdges.current) {
      try {
        // Ensure we have valid arrays to work with
        const nodes = Array.isArray(data.content.nodes)
          ? data.content.nodes
          : [];
        const edges = Array.isArray(data.content.edges)
          ? data.content.edges
          : [];

        console.log('Initializing Y.js with nodes:', nodes);
        console.log('Initializing Y.js with edges:', edges);

        for (const node of nodes) {
          yNodes.current?.push([node]);
        }
        for (const edge of edges) {
          yEdges.current?.push([edge]);
        }
      } catch (error) {
        console.error('Error initializing Y.js arrays:', error);
        console.error('Data content:', data.content);
      }
    }

    // Observe changes on yNodes and yEdges, update React state
    yNodes.current?.observe(() => {
      console.log(
        'yNodes.current?.toArray()',
        yNodes.current?.toArray().length
      );
      setNodes(yNodes.current?.toArray() ?? []);
    });

    yEdges.current?.observe(() => {
      console.log(
        'yEdges.current?.toArray()',
        yEdges.current?.toArray().length
      );
      setEdges(yEdges.current?.toArray() ?? []);
    });

    yDoc.current = ydoc;

    // Clean up on unmount
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [data.id, data.members?.length, data.content, save]);

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    console.log('onNodesChange', changes);
    setNodes((current) => {
      const updated = applyNodeChanges(changes, current);
      // Replace Yjs nodes with updated array
      yDoc.current?.transact(() => {
        yNodes.current?.delete(0, yNodes.current.length);
        yNodes.current?.insert(0, updated);
      });
      return updated;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    console.log('onEdgesChange', changes);
    setEdges((current) => {
      const updated = applyEdgeChanges(changes, current);
      yDoc.current?.transact(() => {
        yEdges.current?.delete(0, yEdges.current.length);
        yEdges.current?.insert(0, updated);
      });
      return updated;
    });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    console.log('onConnect', connection);
    const newEdge: Edge = {
      id: nanoid(),
      type: 'animated',
      ...connection,
    };

    yDoc.current?.transact(() => {
      yEdges.current?.push([newEdge]);
    });
  }, []);

  const addNode = useCallback((node: Node) => {
    console.log('addNode', node);
    yDoc.current?.transact(() => {
      yNodes.current?.push([node]);
    });
  }, []);

  const removeDropNodes = useCallback(() => {
    console.log('removeDropNodes');
    yDoc.current?.transact(() => {
      const currentNodes = yNodes.current?.toArray() ?? [];
      const filteredNodes = currentNodes.filter((n: Node) => n.type !== 'drop');
      yNodes.current?.delete(0, yNodes.current.length);
      yNodes.current?.insert(0, filteredNodes);

      const currentEdges = yEdges.current?.toArray() ?? [];
      const filteredEdges = currentEdges.filter(
        (e: Edge) => e.type !== 'temporary'
      );
      yEdges.current?.delete(0, yEdges.current.length);
      yEdges.current?.insert(0, filteredEdges);
    });
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    removeDropNodes,
  };
};
