'use client';

import { updateProjectAction } from '@/app/actions/project/update';
import { isValidSourceTarget } from '@/lib/xyflow';
import type { projects } from '@/schema';
import { useLocalStorage } from '@uidotdev/usehooks';
import {
  Background,
  type Connection,
  type Edge,
  type EdgeChange,
  type FinalConnectionState,
  type Node,
  type NodeChange,
  ReactFlow,
  type ReactFlowInstance,
  type ReactFlowJsonObject,
  type XYPosition,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  getOutgoers,
  getViewportForBounds,
  useReactFlow,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { Auth } from '../auth';
import { ConnectionLine } from '../connection-line';
import { Controls } from '../controls';
import { AnimatedEdge } from '../edges/animated';
import { TemporaryEdge } from '../edges/temporary';
import { AudioNode } from '../nodes/audio';
import { CommentNode } from '../nodes/comment';
import { DropNode } from '../nodes/drop';
import { ImageNode } from '../nodes/image';
import { LogoNode } from '../nodes/logo';
import { TextNode } from '../nodes/text';
import { VideoNode } from '../nodes/video';
import { Projects } from '../projects';
import { SaveIndicator } from '../save-indicator';
import { Toolbar } from '../toolbar';

const nodeTypes = {
  image: ImageNode,
  text: TextNode,
  drop: DropNode,
  video: VideoNode,
  audio: AudioNode,
  logo: LogoNode,
  comment: CommentNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
  temporary: TemporaryEdge,
};

const SAVE_TIMEOUT = 1000;

type ProjectData = {
  content?:
    | {
        nodes: Node[];
        edges: Edge[];
        x: number;
        y: number;
        zoom: number;
      }
    | undefined;
};

export type CanvasProps = {
  projects: (typeof projects.$inferSelect)[];
  data: typeof projects.$inferSelect;
  userId?: string | undefined;
  defaultContent?: {
    nodes: Node[];
    edges: Edge[];
  };
};

export const CanvasInner = ({
  projects,
  data,
  userId,
  defaultContent,
}: CanvasProps) => {
  const content = data.content as ProjectData['content'];
  const [nodes, setNodes] = useState<Node[]>(
    content?.nodes ?? defaultContent?.nodes ?? []
  );
  const [edges, setEdges] = useState<Edge[]>(
    content?.edges ?? defaultContent?.edges ?? []
  );
  const { getEdges, screenToFlowPosition, getNodes, getNodesBounds } =
    useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [localSave, setLocalSave] = useLocalStorage<ReactFlowJsonObject<
    Node,
    Edge
  > | null>('tersa-local-save', null);
  const [loaded, setLoaded] = useState(false);

  // Restore local save if there is no user ID
  useEffect(() => {
    if (
      localSave &&
      !userId &&
      nodes.length === 0 &&
      edges.length === 0 &&
      !loaded
    ) {
      setNodes(localSave.nodes);
      setEdges(localSave.edges);

      setLoaded(true);
    }
  }, [localSave, nodes, edges, userId, loaded]);

  const getScreenshot = async () => {
    const nodes = getNodes();
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, 1200, 630, 0.5, 2, 16);

    const image = await toPng(
      document.querySelector('.react-flow__viewport') as HTMLElement,
      {
        backgroundColor: 'transparent',
        width: 1200,
        height: 630,
        style: {
          width: '1200px',
          height: '630px',
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      }
    );

    return image;
  };

  const save = useDebouncedCallback(async () => {
    if (!rfInstance) {
      toast.error('No instance found');
      return;
    }

    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const content = rfInstance.toObject();
      const image = await getScreenshot();

      if (!userId) {
        setLocalSave(content);

        return;
      }

      const response = await updateProjectAction(data.id, {
        image,
        content,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      setLastSaved(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, SAVE_TIMEOUT);

  const addNode = useCallback(
    (type: string, position?: XYPosition, data?: Record<string, unknown>) => {
      const newNode: Node = {
        id: nanoid(),
        type,
        data: {
          source: 'primitive',
          ...data,
        },
        position: position ?? { x: 0, y: 0 },
        origin: [0, 0.5],
      };

      setNodes((nds) => nds.concat(newNode));

      return newNode.id;
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'animated' }, eds));
      save();
    },
    [save]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      // when a connection is dropped on the pane it's not valid

      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        const newNodeId = addNode(
          'drop',
          screenToFlowPosition({ x: clientX, y: clientY })
        );

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

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Don't save if only the selected state is changing.
      if (changes.every((change) => change.type === 'select')) {
        return;
      }

      save();
    },
    [save]
  );

  const onNodeDragStop = useCallback(() => {
    save();
  }, [save]);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      save();
    },
    [save]
  );

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      onNodeDragStop={onNodeDragStop}
      edges={edges}
      onEdgesChange={onEdgesChange}
      onConnectStart={onConnectStart}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      isValidConnection={isValidConnection}
      connectionLineComponent={ConnectionLine}
      onInit={setRfInstance}
      fitView
      panOnScroll
    >
      <Controls />
      <Background bgColor="var(--secondary)" />
      <Toolbar />
      <Auth />
      <Projects projects={projects} currentProject={data.id.toString()} />
      <SaveIndicator
        lastSaved={lastSaved ?? data.updatedAt ?? data.createdAt}
        saving={isSaving}
      />
    </ReactFlow>
  );
};
