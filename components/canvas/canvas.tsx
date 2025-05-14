'use client';

import { useAnalytics } from '@/hooks/use-analytics';
import { useSaveProject } from '@/hooks/use-save-project';
import { useUser } from '@/hooks/use-user';
import { isValidSourceTarget } from '@/lib/xyflow';
import { NodeDropzoneProvider } from '@/providers/node-dropzone';
import { NodeOperationsProvider } from '@/providers/node-operations';
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
import { ConnectionLine } from '../connection-line';
import { Controls } from '../controls';
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

export const Canvas = ({ data, canvasProps }: CanvasProps) => {
  const content = data.content as ProjectData['content'];
  const [nodes, setNodes] = useState<Node[]>(content?.nodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(content?.edges ?? []);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const { getEdges, screenToFlowPosition, getNodes, getNode, updateNode } =
    useReactFlow();
  const { isSaving, lastSaved, save } = useSaveProject(data.id);
  const user = useUser();
  const analytics = useAnalytics();

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      setNodes((current) => {
        const updated = applyNodeChanges(changes, current);
        save();
        return updated;
      });
    },
    [save]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((current) => {
        const updated = applyEdgeChanges(changes, current);
        save();
        return updated;
      });
    },
    [save]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: nanoid(),
        type: 'animated',
        ...connection,
      };
      setEdges((eds: Edge[]) => eds.concat(newEdge));
      save();
    },
    [save]
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

      setNodes((nds: Node[]) => nds.concat(newNode));
      save();

      analytics.track('toolbar', 'node', 'added', {
        type,
      });

      return newNode.id;
    },
    [save, analytics]
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

        setEdges((eds: Edge[]) =>
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
    setNodes((nds: Node[]) => nds.filter((n: Node) => n.type !== 'drop'));
    setEdges((eds: Edge[]) => eds.filter((e: Edge) => e.type !== 'temporary'));
    save();
  }, [save]);

  const addDropNode = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (
        !(event.target instanceof HTMLDivElement) ||
        !event.target.classList.contains('react-flow__pane')
      ) {
        return;
      }

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
    setNodes((nodes: Node[]) =>
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
    setNodes((nodes: Node[]) =>
      nodes.map((node: Node) => ({
        ...node,
        selected: false,
      }))
    );

    // Add new nodes
    setNodes((nodes: Node[]) => [...nodes, ...newNodes]);
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
  );
};
