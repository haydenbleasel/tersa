'use client';

import { createClient } from '@/lib/supabase/client';
import SupabaseProvider from '@/lib/supabase/yjs';
import {
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  useReactFlow,
} from '@xyflow/react';
import { useCallback } from 'react';
import { useRef } from 'react';
import * as Y from 'yjs';

const applyNodeChanges = (
  yArray: Y.Array<Node>,
  changes: NodeChange<Node>[]
) => {
  yArray.doc?.transact(() => {
    for (const change of changes) {
      switch (change.type) {
        case 'add':
          if (change.item) {
            console.log('log:add', change.item);
            yArray.push([change.item]);
          }
          break;
        case 'remove':
          if (change.id) {
            console.log('log:remove', change.id);
            const index = yArray
              .toArray()
              .findIndex((item) => item.id === change.id);
            if (index !== -1) yArray.delete(index, 1);
          }
          break;
        case 'replace':
          if (change.item) {
            console.log('log:replace', change.item);
            yArray.delete(0, yArray.length);
            yArray.push([change.item]);
          }
          break;
        case 'dimensions':
          if (change.id) {
            console.log('log:dimensions', change.id);
            const index = yArray
              .toArray()
              .findIndex((item) => item.id === change.id);
            if (index !== -1) {
              const node = yArray.get(index);
              if (node && change.dimensions) {
                yArray.delete(index, 1);
                yArray.insert(index, [
                  {
                    ...node,
                    measured: change.dimensions,
                  },
                ]);
              }
            }
          }
          break;
        case 'position':
          if (change.id) {
            console.log('log:position', change.id);
            const index = yArray
              .toArray()
              .findIndex((item) => item.id === change.id);
            if (index !== -1) {
              const node = yArray.get(index);
              if (node && change.position) {
                yArray.delete(index, 1);
                yArray.insert(index, [
                  {
                    ...node,
                    position: change.position,
                  },
                ]);
              }
            }
          }
          break;
        case 'select':
          // Do nothing, we'll handle this in Presence.
          break;
        default:
          console.log('log:default', change);
          break;
      }
    }
  });
};

const applyEdgeChanges = (
  yArray: Y.Array<Edge>,
  changes: EdgeChange<Edge>[]
) => {
  yArray.doc?.transact(() => {
    for (const change of changes) {
      switch (change.type) {
        case 'add':
          if (change.item) {
            console.log('log:add', change.item);
            yArray.push([change.item]);
          }
          break;
        case 'remove':
          if (change.id) {
            console.log('log:remove', change.id);
            const index = yArray
              .toArray()
              .findIndex((item) => item.id === change.id);
            if (index !== -1) yArray.delete(index, 1);
          }
          break;
        case 'replace':
          if (change.item) {
            console.log('log:replace', change.item);
            yArray.delete(0, yArray.length);
            yArray.push([change.item]);
          }
          break;
        case 'select':
          // Do nothing, we'll handle this in Presence.
          break;
        default:
          console.log('log:default', change);
          break;
      }
    }
  });
};

export const useCollaboration = (
  projectId: string,
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

    console.log('Initializing collaboration...');

    const supabase = createClient();

    yDoc.current = new Y.Doc();
    yNodes.current = yDoc.current.getArray('nodes');
    yEdges.current = yDoc.current.getArray('edges');

    const provider = new SupabaseProvider(yDoc.current, supabase, {
      channel: `${projectId}-canvas`,
      tableName: 'project',
      columnName: 'content',
      id: projectId,
    });

    // Initial data sync
    const updateNodes = () => setNodes(yNodes.current?.toArray() ?? []);
    const updateEdges = () => setEdges(yEdges.current?.toArray() ?? []);

    yNodes.current?.observe(updateNodes);
    yEdges.current?.observe(updateEdges);

    provider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        updateNodes();
        updateEdges();
      }
    });

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
  }, [projectId, setNodes, setEdges, onSaveSnapshot]);

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    console.log('log:onNodesChange', changes, yNodes.current);
    if (yNodes.current) {
      applyNodeChanges(yNodes.current, changes);
    }
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    console.log('log:onEdgesChange', changes, yEdges.current);
    if (yEdges.current) {
      applyEdgeChanges(yEdges.current, changes);
    }
  }, []);

  return { init, yDoc, yNodes, yEdges, onNodesChange, onEdgesChange };
};
