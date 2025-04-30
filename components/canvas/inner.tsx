'use client';
import { useSaveProject } from '@/hooks/use-save-project';
import { useUser } from '@/hooks/use-user';
import { isValidSourceTarget } from '@/lib/xyflow';
import type { projects } from '@/schema';
import {
  Background,
  type Connection,
  type Edge,
  type EdgeChange,
  type FinalConnectionState,
  type Node,
  type NodeChange,
  ReactFlow,
  type ReactFlowProps,
  type Viewport,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  getOutgoers,
  useReactFlow,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { ConnectionLine } from '../connection-line';
import { edgeTypes } from '../edges';
import { nodeTypes } from '../nodes';

type ProjectData = {
  content?:
    | {
        nodes: Node[];
        edges: Edge[];
        viewport: Viewport;
      }
    | undefined;
};

export type CanvasProps = {
  projects: (typeof projects.$inferSelect)[];
  data: typeof projects.$inferSelect;
  defaultContent?: {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  };
  canvasProps?: ReactFlowProps;
};

const SaveIndicator = dynamic(
  () => import('../save-indicator').then((mod) => mod.SaveIndicator),
  {
    ssr: false,
  }
);

const Menu = dynamic(() => import('../menu').then((mod) => mod.Menu), {
  ssr: false,
});

const Controls = dynamic(
  () => import('../controls').then((mod) => mod.Controls),
  {
    ssr: false,
  }
);

const Toolbar = dynamic(() => import('../toolbar').then((mod) => mod.Toolbar), {
  ssr: false,
});

const Projects = dynamic(
  () => import('../projects').then((mod) => mod.Projects),
  {
    ssr: false,
  }
);

export const CanvasInner = ({
  projects,
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
  const [viewport, setViewport] = useState<Viewport>(
    content?.viewport ?? defaultContent?.viewport ?? { x: 0, y: 0, zoom: 1 }
  );
  const { getEdges, screenToFlowPosition, getNodes } = useReactFlow();
  const { isSaving, lastSaved, save } = useSaveProject(data.id);
  const user = useUser();

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

  const onViewportChange = useCallback(
    (viewport: Viewport) => {
      setViewport(viewport);
      save();
    },
    [save]
  );

  return (
    <>
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
        fitView
        panOnScroll
        viewport={viewport}
        onViewportChange={onViewportChange}
        {...canvasProps}
      >
        <Background />
        {user && (
          <>
            <Controls />
            <Toolbar />
            <Projects projects={projects} currentProject={data.id} />
            <Menu />
            <SaveIndicator
              lastSaved={lastSaved ?? data.updatedAt ?? data.createdAt}
              saving={isSaving}
            />
          </>
        )}
      </ReactFlow>
      {/* <RealtimeCursors roomName={data.id} username={userId ?? 'Demo user'} /> */}
    </>
  );
};
