"use client";

import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Edge,
  getOutgoers,
  type IsValidConnection,
  type Node,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  type ReactFlowProps,
  useReactFlow,
} from "@xyflow/react";
import { BoxSelectIcon, PlusIcon } from "lucide-react";
import { nanoid } from "nanoid";
import type { MouseEvent, MouseEventHandler } from "react";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDebouncedCallback } from "use-debounce";
import { updateProjectAction } from "@/app/actions/project/update";
import { useAnalytics } from "@/hooks/use-analytics";
import { useSaveProject } from "@/hooks/use-save-project";
import { handleError } from "@/lib/error/handle";
import { isValidSourceTarget } from "@/lib/xyflow";
import { NodeDropzoneProvider } from "@/providers/node-dropzone";
import { NodeOperationsProvider } from "@/providers/node-operations";
import { useProject } from "@/providers/project";
import { ConnectionLine } from "./connection-line";
import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

export const Canvas = ({ children, ...props }: ReactFlowProps) => {
  const project = useProject();
  const {
    onConnect,
    onEdgesChange,
    onNodesChange,
    nodes: initialNodes,
    edges: initialEdges,
    ...restProps
  } = props ?? {};
  const content = project?.content as { nodes: Node[]; edges: Edge[] };
  const [nodes, setNodes] = useState<Node[]>(
    initialNodes ?? content?.nodes ?? []
  );
  const [edges, setEdges] = useState<Edge[]>(
    initialEdges ?? content?.edges ?? []
  );
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const {
    getEdges,
    toObject,
    screenToFlowPosition,
    getNodes,
    getNode,
    updateNode,
  } = useReactFlow();
  const analytics = useAnalytics();
  const [saveState, setSaveState] = useSaveProject();

  const save = useDebouncedCallback(async () => {
    if (saveState.isSaving || !project?.userId || !project?.id) {
      return;
    }

    try {
      setSaveState((prev) => ({ ...prev, isSaving: true }));

      const response = await updateProjectAction(project.id, {
        content: toObject(),
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      setSaveState((prev) => ({ ...prev, lastSaved: new Date() }));
    } catch (error) {
      handleError("Error saving project", error);
    } finally {
      setSaveState((prev) => ({ ...prev, isSaving: false }));
    }
  }, 1000);

  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      setNodes((current) => {
        const updated = applyNodeChanges(changes, current);
        save();
        onNodesChange?.(changes);
        return updated;
      });
    },
    [save, onNodesChange]
  );

  const handleEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      setEdges((current) => {
        const updated = applyEdgeChanges(changes, current);
        save();
        onEdgesChange?.(changes);
        return updated;
      });
    },
    [save, onEdgesChange]
  );

  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      const newEdge: Edge = {
        id: nanoid(),
        type: "animated",
        ...connection,
      };
      setEdges((eds: Edge[]) => eds.concat(newEdge));
      save();
      onConnect?.(connection);
    },
    [save, onConnect]
  );

  const addNode = useCallback(
    (type: string, options?: Record<string, unknown>) => {
      const { data: nodeData, ...nodeOptions } = options ?? {};
      const newNode: Node = {
        id: nanoid(),
        type,
        data: {
          ...(nodeData ? nodeData : {}),
        },
        position: { x: 0, y: 0 },
        origin: [0, 0.5],
        ...nodeOptions,
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
      save();

      analytics.track("toolbar", "node", "added", {
        type,
      });

      return newNode.id;
    },
    [save, analytics]
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const node = getNode(id);

      if (!node?.type) {
        return;
      }

      const { id: _oldId, ...nodeProps } = node;

      const newId = addNode(node.type, {
        ...nodeProps,
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

  const handleConnectEnd = useCallback<OnConnectEnd>(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid

      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;

        const sourceId = connectionState.fromNode?.id;
        const isSourceHandle = connectionState.fromHandle?.type === "source";

        if (!sourceId) {
          return;
        }

        const newNodeId = addNode("drop", {
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
            type: "temporary",
          })
        );
      }
    },
    [addNode, screenToFlowPosition]
  );

  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const target = currentNodes.find((node) => node.id === connection.target);

      // Prevent connecting audio nodes to anything except transcribe nodes
      if (connection.source) {
        const source = currentNodes.find(
          (node) => node.id === connection.source
        );

        if (!(source && target)) {
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

        for (const outgoer of getOutgoers(node, currentNodes, currentEdges)) {
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

  const handleConnectStart = useCallback<OnConnectStart>(() => {
    // Delete any drop nodes when starting to drag a node
    setNodes((nds: Node[]) => nds.filter((n: Node) => n.type !== "drop"));
    setEdges((eds: Edge[]) => eds.filter((e: Edge) => e.type !== "temporary"));
    save();
  }, [save]);

  const addDropNode = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      const { x, y } = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode("drop", {
        position: { x, y },
      });
    },
    [addNode, screenToFlowPosition]
  );

  const handleSelectAll = useCallback(() => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => ({ ...node, selected: true }))
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
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => ({
        ...node,
        selected: false,
      }))
    );

    // Add new nodes
    setNodes((nds: Node[]) => [...nds, ...newNodes]);
  }, [copiedNodes]);

  const handleDuplicateAll = useCallback(() => {
    const selected = getNodes().filter((node) => node.selected);

    for (const node of selected) {
      duplicateNode(node.id);
    }
  }, [getNodes, duplicateNode]);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    if (
      !(
        event.target instanceof HTMLElement &&
        event.target.classList.contains("react-flow__pane")
      )
    ) {
      event.preventDefault();
    }
  }, []);

  useHotkeys("meta+a", handleSelectAll, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  useHotkeys("meta+d", handleDuplicateAll, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  useHotkeys("meta+c", handleCopy, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  useHotkeys("meta+v", handlePaste, {
    enableOnContentEditable: false,
    preventDefault: true,
  });

  return (
    <NodeOperationsProvider addNode={addNode} duplicateNode={duplicateNode}>
      <NodeDropzoneProvider>
        <ContextMenu>
          <ContextMenuTrigger onContextMenu={handleContextMenu}>
            <ReactFlow
              connectionLineComponent={ConnectionLine}
              deleteKeyCode={["Backspace", "Delete"]}
              edges={edges}
              edgeTypes={edgeTypes}
              fitView
              isValidConnection={isValidConnection}
              nodes={nodes}
              nodeTypes={nodeTypes}
              onConnect={handleConnect}
              onConnectEnd={handleConnectEnd}
              onConnectStart={handleConnectStart}
              onDoubleClick={addDropNode}
              onEdgesChange={handleEdgesChange}
              onNodesChange={handleNodesChange}
              panOnDrag={false}
              panOnScroll
              selectionOnDrag={true}
              zoomOnDoubleClick={false}
              {...restProps}
            >
              <Background />
              {children}
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
