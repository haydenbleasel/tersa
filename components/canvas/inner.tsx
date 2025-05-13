'use client';

import { useSaveProject } from '@/hooks/use-save-project';
import { useUser } from '@/hooks/use-user';
import { env } from '@/lib/env';
import { isValidSourceTarget } from '@/lib/xyflow';
import { NodeDropzoneProvider } from '@/providers/node-dropzone';
import { NodeOperationsProvider } from '@/providers/node-operations';
import { ProjectProvider } from '@/providers/project';
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
import { BoxSelectIcon, PlusIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { MouseEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { ConnectionLine } from '../connection-line';
import { Controls } from '../controls';
import { RealtimeCursors } from '../cursors';
import { edgeTypes } from '../edges';
import { nodeTypes } from '../nodes';
import { SaveIndicator } from '../save-indicator';
import { Toolbar } from '../toolbar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';

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
  canvasProps?: ReactFlowProps;
};

export const CanvasInner = ({ data, canvasProps }: CanvasProps) => {
  const content = data.content as ProjectData['content'];
  const [nodes, setNodes] = useState<Node[]>(content?.nodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(content?.edges ?? []);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const { getEdges, screenToFlowPosition, getNodes, getNode, updateNode } =
    useReactFlow();
  const { isSaving, lastSaved, save } = useSaveProject(data.id);
  const user = useUser();

  const yDoc = useRef<Y.Doc | null>(null);
  const yNodes = useRef<Y.Array<Node> | null>(null);
  const yEdges = useRef<Y.Array<Edge> | null>(null);

  useEffect(() => {
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

    yDoc.current?.transact(() => {
      yEdges.current?.push([newEdge]);
    });
  }, []);

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

  const duplicateNode = useCallback(
    (id: string) => {
      const node = getNode(id);

      if (!node || !node.type) {
        return;
      }

      const { id: oldId, ...rest } = node;

      const newId = addNode(node.type, {
        ...rest,
        position: {
          x: node.position.x + 200,
          y: node.position.y + 200,
        },
        selected: true,
      });

      setTimeout(() => {
        updateNode(id, { selected: false });
        updateNode(newId, { selected: true });
      }, 0);
    },
    [addNode, getNode, updateNode]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      // when a connection is dropped on the pane it's not valid

      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        const sourceId = connectionState.fromNode?.id;
        const isSourceHandle = connectionState.fromHandle?.type === 'source';

        if (!sourceId) {
          return;
        }

        const newNodeId = addNode('drop', {
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: {
            isSource: !isSourceHandle,
          },
        });

        setEdges((eds) =>
          eds.concat({
            id: nanoid(),
            source: isSourceHandle ? sourceId : newNodeId,
            target: isSourceHandle ? newNodeId : sourceId,
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

  const addDropNode = useCallback<MouseEventHandler<HTMLDivElement>>(
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

  const handleSelectAll = useCallback(() => {
    setNodes(nodes.map((node) => ({ ...node, selected: true })));
  }, [nodes]);

  const handleCopy = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      setCopiedNodes(selectedNodes);
    }
  }, [getNodes]);

  const handlePaste = useCallback(() => {
    if (copiedNodes.length === 0) {
      return;
    }

    const newNodes = copiedNodes.map((node) => ({
      ...node,
      id: nanoid(),
      position: {
        x: node.position.x + 200,
        y: node.position.y + 200,
      },
      selected: true,
    }));

    // Unselect all existing nodes
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: false,
      }))
    );

    // Add new nodes
    setNodes((nodes) => [...nodes, ...newNodes]);
  }, [copiedNodes]);

  const handleDuplicateAll = useCallback(() => {
    const selected = getNodes().filter((node) => node.selected);

    for (const node of selected) {
      duplicateNode(node.id);
    }
  }, [getNodes, duplicateNode]);

  useHotkeys('meta+a', handleSelectAll, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  useHotkeys('meta+d', handleDuplicateAll, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  useHotkeys('meta+c', handleCopy, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  useHotkeys('meta+v', handlePaste, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  return (
    <ProjectProvider data={data}>
      <NodeOperationsProvider addNode={addNode} duplicateNode={duplicateNode}>
        <NodeDropzoneProvider>
          <ContextMenu>
            <ContextMenuTrigger>
              <ReactFlow
                deleteKeyCode={['Backspace', 'Delete']}
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
                panOnDrag={false}
                selectionOnDrag={true}
                onDoubleClick={addDropNode}
                {...canvasProps}
              >
                <Background />
                {!data.id.includes('demo') && user && (
                  <>
                    <Controls />
                    <Toolbar />
                    <SaveIndicator lastSaved={lastSaved} saving={isSaving} />
                    {Boolean(data.members?.length) && (
                      <RealtimeCursors roomName={`${data.id}-cursors`} />
                    )}
                  </>
                )}
              </ReactFlow>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={addDropNode}>
                <PlusIcon size={12} />
                <span>Add a new node</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={handleSelectAll}>
                <BoxSelectIcon size={12} />
                <span>Select all</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </NodeDropzoneProvider>
      </NodeOperationsProvider>
    </ProjectProvider>
  );
};
