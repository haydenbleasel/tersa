'use client';

import { useSaveProject } from '@/hooks/use-save-project';
import { useUser } from '@/hooks/use-user';
import { env } from '@/lib/env';
import { isValidSourceTarget } from '@/lib/xyflow';
import { NodeDropzoneProvider } from '@/providers/node-dropzone';
import type { projects } from '@/schema';
import {
  Background,
  type FinalConnectionState,
  ReactFlow,
  type ReactFlowProps,
  getOutgoers,
  useReactFlow,
} from '@xyflow/react';
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
import type { MouseEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { ConnectionLine } from '../connection-line';
import { Controls } from '../controls';
import { edgeTypes } from '../edges';
import { nodeTypes } from '../nodes';
import { SaveIndicator } from '../save-indicator';
import { RealtimeCursors } from '../supabase-ui/realtime-cursors';
import { Toolbar } from '../toolbar';

type ProjectData = {
  content?:
    | {
        nodes: Node[];
        edges: Edge[];
      }
    | undefined;
};

export type CanvasProps = {
  data: typeof projects.$inferSelect;
  defaultContent?: {
    nodes: Node[];
    edges: Edge[];
  };
  canvasProps?: ReactFlowProps;
};

export const CanvasInner = ({
  data,
  defaultContent,
  canvasProps,
}: CanvasProps) => {
  const content = data.content as ProjectData['content'];
  const [nodes, setNodes] = useState<Node[]>(
    content?.nodes ?? defaultContent?.nodes ?? []
  );
  const [edges, setEdges] = useState<Edge[]>(
    content?.edges ?? defaultContent?.edges ?? []
  );
  const { getEdges, screenToFlowPosition, getNodes } = useReactFlow();
  const { isSaving, lastSaved, save } = useSaveProject(data.id);
  const user = useUser();

  const yDoc = useRef<Y.Doc | null>(null);
  const yNodes = useRef<Y.Array<Node> | null>(null);
  const yEdges = useRef<Y.Array<Edge> | null>(null);

  useEffect(() => {
    // Create a new Y.Doc (CRDT document)
    const ydoc = new Y.Doc();

    yDoc.current = ydoc;

    // Connect peers in the same "room" for P2P sync. Clients must use the same roomName.
    const provider = new WebrtcProvider(`tersa-${data.id}`, ydoc, {
      signaling: [env.NEXT_PUBLIC_WSS_SIGNALING_URL],
    });

    // Optionally, get awareness to share cursor/user info
    // const awareness = provider.awareness;

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

    // Clean up on unmount
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [data.id, save]);

  // Handlers to apply local changes both to React Flow and Y.js
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
    setEdges((current) => {
      const updated = [...current, newEdge];
      yEdges.current?.push([newEdge]);
      return updated;
    });
  }, []);

  useHotkeys('ctrl+a', (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const isEditableTarget =
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable;

    if (isEditableTarget) {
      // Skip if we're in an editable element
      return;
    }

    event.preventDefault();

    const allNodes = getNodes();
    if (allNodes.length > 0) {
      const newNodes = [...allNodes];

      for (const node of newNodes) {
        node.selected = true;
      }

      setNodes(newNodes);
    }
  });

  const addNode = useCallback(
    (type: string, options?: Record<string, unknown>) => {
      const { data: nodeData, ...rest } = options ?? {};
      const newNode: Node = {
        id: nanoid(),
        type,
        data: {
          source: 'primitive',
          ...(nodeData ? nodeData : {}),
        },
        position: { x: 0, y: 0 },
        origin: [0, 0.5],
        ...rest,
      };

      setNodes((nds) => nds.concat(newNode));

      return newNode.id;
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      // when a connection is dropped on the pane it's not valid

      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        const newNodeId = addNode('drop', {
          position: screenToFlowPosition({ x: clientX, y: clientY }),
        });

        setEdges((eds) =>
          eds.concat({
            id: newNodeId,
            source: connectionState.fromNode?.id ?? '',
            target: newNodeId,
            type: 'temporary',
          })
        );
      }
    },
    [addNode, screenToFlowPosition]
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const nodes = getNodes();
      const edges = getEdges();
      const target = nodes.find((node) => node.id === connection.target);

      // Prevent connecting audio nodes to anything except transcribe nodes
      if (connection.source) {
        const source = nodes.find((node) => node.id === connection.source);

        if (!source || !target) {
          return false;
        }

        const valid = isValidSourceTarget(source, target);

        if (!valid) {
          return false;
        }
      }

      // Prevent cycles
      const hasCycle = (node: Node, visited = new Set<string>()) => {
        if (visited.has(node.id)) {
          return false;
        }

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source || hasCycle(outgoer, visited)) {
            return true;
          }
        }
      };

      if (!target || target.id === connection.source) {
        return false;
      }

      return !hasCycle(target);
    },
    [getNodes, getEdges]
  );

  const onConnectStart = useCallback(() => {
    // Delete any drop nodes when starting to drag a node
    setNodes((nds) => nds.filter((n) => n.type !== 'drop'));

    // Also remove any temporary edges
    setEdges((eds) => eds.filter((e) => e.type !== 'temporary'));
  }, []);

  const handleDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const { x, y } = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode('drop', {
        position: { x, y },
      });
    },
    [addNode, screenToFlowPosition]
  );

  return (
    <NodeDropzoneProvider addNode={addNode}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        connectionLineComponent={ConnectionLine}
        panOnScroll
        fitView
        zoomOnDoubleClick={false}
        onDoubleClick={handleDoubleClick}
        {...canvasProps}
      >
        <Background />
        {!data.id.includes('demo') && user && (
          <>
            <Controls />
            <Toolbar />
            <SaveIndicator
              lastSaved={lastSaved ?? data.updatedAt ?? data.createdAt}
              saving={isSaving}
            />
            <RealtimeCursors roomName={`${data.id}-cursors`} />
          </>
        )}
      </ReactFlow>
    </NodeDropzoneProvider>
  );
};
