import { env } from '@/lib/env';
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
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

type CollaborationProps = {
  id: string;
  members: string[] | null;
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!data.members?.length) {
      return;
    }

    // Create a new Y.Doc (CRDT document)
    const ydoc = new Y.Doc();

    // Connect peers in the same "room" for P2P sync. Clients must use the same roomName.
    const provider = new WebrtcProvider(`tersa-${data.id}`, ydoc, {
      signaling: [env.NEXT_PUBLIC_WSS_SIGNALING_URL],
    });

    // Create shared arrays for nodes and edges (initially empty)
    yNodes.current = ydoc.getArray<Node>('nodes');
    yEdges.current = ydoc.getArray<Edge>('edges');

    // Observe changes on yNodes and yEdges, update React state
    yNodes.current?.observe(() => {
      setNodes(yNodes.current?.toArray() ?? []);
    });

    yEdges.current?.observe(() => {
      setEdges(yEdges.current?.toArray() ?? []);
    });

    // Save the nodes and edges to the database
    ydoc.on('update', save);

    yDoc.current = ydoc;

    // Clean up on unmount
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [data.id, data.members?.length, save]);

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
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
    yDoc.current?.transact(() => {
      yNodes.current?.push([node]);
    });
  }, []);

  const removeDropNodes = useCallback(() => {
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
