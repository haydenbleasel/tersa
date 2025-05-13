'use client';

import { useCollaboration } from '@/hooks/use-collaboration';
import { useSaveProject } from '@/hooks/use-save-project';
import { useUser } from '@/hooks/use-user';
import { isValidSourceTarget } from '@/lib/xyflow';
import { NodeDropzoneProvider } from '@/providers/node-dropzone';
import { NodeOperationsProvider } from '@/providers/node-operations';
import { ProjectProvider } from '@/providers/project';
import { useRealtime } from '@/providers/realtime';
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
import { useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { ConnectionLine } from './connection-line';
import { Controls } from './controls';
import { RealtimeCursors } from './cursors';
import { edgeTypes } from './edges';
import { nodeTypes } from './nodes';
import { SaveIndicator } from './save-indicator';
import { Toolbar } from './toolbar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

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

export const Canvas = ({ data, canvasProps }: CanvasProps) => {
  const content = data.content as ProjectData['content'];
  const [localNodes, setLocalNodes] = useState<Node[]>(content?.nodes ?? []);
  const [localEdges, setLocalEdges] = useState<Edge[]>(content?.edges ?? []);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const { getEdges, screenToFlowPosition, getNodes, getNode, updateNode } =
    useReactFlow();
  const { isSaving, lastSaved, save } = useSaveProject(data.id);
  const user = useUser();
  const { channelRef } = useRealtime();

  const {
    nodes: yjsNodes,
    edges: yjsEdges,
    onNodesChange: yjsOnNodesChange,
    onEdgesChange: yjsOnEdgesChange,
    onConnect: yjsOnConnect,
    addNode: yjsAddNode,
    removeDropNodes: yjsRemoveDropNodes,
  } = useCollaboration({ id: data.id, members: data.members, content }, save);

  // Use Y.js state if there are members, otherwise use local state
  const nodes = data.members?.length ? yjsNodes : localNodes;
  const edges = data.members?.length ? yjsEdges : localEdges;

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      if (data.members?.length) {
        yjsOnNodesChange(changes);

        // Broadcast selection changes
        for (const change of changes) {
          if (change.type === 'select' && user) {
            channelRef.current?.send({
              type: 'broadcast',
              event: 'node-selection',
              payload: {
                nodeId: change.id,
                userId: change.selected ? user.id : null,
              },
            });
          }
        }
      } else {
        setLocalNodes((current) => {
          const updated = applyNodeChanges(changes, current);
          save();
          return updated;
        });
      }
    },
    [data.members?.length, yjsOnNodesChange, save, user, channelRef]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      if (data.members?.length) {
        yjsOnEdgesChange(changes);
      } else {
        setLocalEdges((current) => {
          const updated = applyEdgeChanges(changes, current);
          save();
          return updated;
        });
      }
    },
    [data.members?.length, yjsOnEdgesChange, save]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (data.members?.length) {
        yjsOnConnect(connection);
      } else {
        const newEdge: Edge = {
          id: nanoid(),
          type: 'animated',
          ...connection,
        };
        setLocalEdges((eds: Edge[]) => eds.concat(newEdge));
        save();
      }
    },
    [data.members?.length, yjsOnConnect, save]
  );

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

      if (data.members?.length) {
        yjsAddNode(newNode);
      } else {
        setLocalNodes((nds: Node[]) => nds.concat(newNode));
        save();
      }

      return newNode.id;
    },
    [data.members?.length, yjsAddNode, save]
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

        setLocalEdges((eds: Edge[]) =>
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
    if (data.members?.length) {
      yjsRemoveDropNodes();
    } else {
      setLocalNodes((nds: Node[]) =>
        nds.filter((n: Node) => n.type !== 'drop')
      );
      setLocalEdges((eds: Edge[]) =>
        eds.filter((e: Edge) => e.type !== 'temporary')
      );
      save();
    }
  }, [data.members?.length, yjsRemoveDropNodes, save]);

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
    setLocalNodes((nodes: Node[]) =>
      nodes.map((node: Node) => ({ ...node, selected: true }))
    );
  }, []);

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
    setLocalNodes((nodes: Node[]) =>
      nodes.map((node: Node) => ({
        ...node,
        selected: false,
      }))
    );

    // Add new nodes
    setLocalNodes((nodes: Node[]) => [...nodes, ...newNodes]);
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

  console.log(nodes, edges, 'canvas');

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
                    {Boolean(data.members?.length) && <RealtimeCursors />}
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
