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
      resyncInterval: 5000, // Optional
    });

    const ynodes = ydoc.getArray<Node>('nodes');
    const yedges = ydoc.getArray<Edge>('edges');

    provider.on('message', save);

    // Initialize with existing content if available
    if (data.content) {
      ynodes.push(data.content.nodes);
      yedges.push(data.content.edges);
    }

    // Observe changes on yNodes, update React state
    ynodes.observe(() => {
      console.log('ynodes.observe', ynodes.toArray());
      setNodes(ynodes.toArray());
    });

    // Observe changes on yEdges, update React state
    yedges.observe(() => {
      console.log('yedges.observe', yedges.toArray());
      setEdges(yedges.toArray());
    });

    // Store references to the Y.js arrays
    yDoc.current = ydoc;
    yNodes.current = ynodes;
    yEdges.current = yedges;

    // Clean up on unmount
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [data.id, data.members?.length, data.content, save]);

  // Handle changes on yNodes
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
    // Check if node already exists to prevent duplicates
    const existingNode = yNodes.current
      ?.toArray()
      .find((n) => n.id === node.id);
    if (!existingNode) {
      yDoc.current?.transact(() => {
        yNodes.current?.push([node]);
      });
    }
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
