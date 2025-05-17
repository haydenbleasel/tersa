'use client';

import { createClient } from '@/lib/supabase/client';
import SupabaseProvider from '@/lib/supabase/yjs';
import {
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react';
import { useCallback } from 'react';
import { useRef } from 'react';
import * as Y from 'yjs';

export const useCollaboration = (
  projectId: string,
  projectData: { nodes: Node[]; edges: Edge[] },
  onSaveSnapshot?: (snapshot: { nodes: Node[]; edges: Edge[] }) => void
) => {
  const yDoc = useRef<Y.Doc | null>(null);
  const yNodes = useRef<Y.Array<Node> | null>(null);
  const yEdges = useRef<Y.Array<Edge> | null>(null);
  const { setNodes, setEdges } = useReactFlow();

  const init = useCallback(() => {
    if (yDoc.current) {
      return;
    }

    const supabase = createClient();

    yDoc.current = new Y.Doc();
    yNodes.current = yDoc.current.getArray('nodes');
    yEdges.current = yDoc.current.getArray('edges');

    if (
      yNodes.current.length === 0 &&
      yEdges.current.length === 0 &&
      projectData
    ) {
      yNodes.current.push(projectData.nodes);
      yEdges.current.push(projectData.edges);
    }

    const provider = new SupabaseProvider(yDoc.current, supabase, {
      channel: `${projectId}-canvas`,
      tableName: 'project',
      columnName: 'content',
      id: projectId,
      resyncInterval: false,
    });

    // Initial data sync
    const updateNodes = (event: Y.YEvent<Y.Array<Node>>) => {
      if (!event.transaction.local) {
        const updated = yNodes.current?.toArray() ?? [];
        setNodes([...updated]); // spread to force React to detect change
      }
    };

    const updateEdges = (event: Y.YEvent<Y.Array<Edge>>) => {
      if (!event.transaction.local) {
        const updated = yEdges.current?.toArray() ?? [];
        setEdges([...updated]);
      }
    };

    yNodes.current?.observe(updateNodes);
    yEdges.current?.observe(updateEdges);

    if (onSaveSnapshot && yDoc.current) {
      const interval = setInterval(() => {
        const nodes = yNodes.current?.toArray() ?? [];
        const edges = yEdges.current?.toArray() ?? [];
        onSaveSnapshot({ nodes, edges });
      }, 5000); // save every 5s

      // Clear interval on cleanup
      return () => {
        yNodes.current?.unobserve(updateNodes);
        yEdges.current?.unobserve(updateEdges);
        provider.destroy();
        yDoc.current?.destroy();
        clearInterval(interval);
      };
    }

    return () => {
      yNodes.current?.unobserve(updateNodes);
      yEdges.current?.unobserve(updateEdges);
      provider.destroy();
      yDoc.current?.destroy();
    };
  }, [projectId, setNodes, setEdges, onSaveSnapshot, projectData]);

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    if (!yNodes.current) {
      return;
    }

    const current = yNodes.current.toArray();
    const updated = applyNodeChanges(changes, current);

    yNodes.current.doc?.transact(() => {
      yNodes.current?.delete(0, yNodes.current?.length ?? 0);
      yNodes.current?.insert(0, updated);
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    if (!yEdges.current) {
      return;
    }

    const current = yEdges.current.toArray();
    const updated = applyEdgeChanges(changes, current);

    yEdges.current.doc?.transact(() => {
      yEdges.current?.delete(0, yEdges.current?.length ?? 0);
      yEdges.current?.push(updated);
    });
  }, []);

  return { init, yDoc, yNodes, yEdges, onNodesChange, onEdgesChange };
};
