import { useCallback, useEffect, useState, useRef } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useNodeOperations } from '@/providers/node-operations';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface CanvasOperation {
  type: string;
  args: any;
}

interface CanvasHistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface AgentActionPayload {
  operation: string;
  args: any;
  userId: string;
  userName?: string;
}

export function useCanvasBridge() {
  const reactFlowInstance = useReactFlow();
  const { addNode } = useNodeOperations();
  const user = useUser();
  const params = useParams();
  const projectId = params.projectId as string;
  const [canvasState, setCanvasState] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({ nodes: [], edges: [] });
  
  // Store canvas history for rollback
  const canvasHistory = useRef<CanvasHistoryState[]>([]);
  const channelRef = useRef<any>(null);
  
  // Get selected nodes from ReactFlow
  const selectedNodes = reactFlowInstance?.getNodes().filter(node => node.selected) || [];
  
  // Update canvas state when nodes or edges change
  useEffect(() => {
    if (reactFlowInstance) {
      const nodes = reactFlowInstance.getNodes();
      const edges = reactFlowInstance.getEdges();
      setCanvasState({ nodes, edges });
    }
  }, [reactFlowInstance]);
  
  // Save current state to history
  const saveStateToHistory = useCallback(() => {
    if (reactFlowInstance) {
      const nodes = reactFlowInstance.getNodes();
      const edges = reactFlowInstance.getEdges();
      
      // Keep only the last 10 states
      canvasHistory.current = [
        ...canvasHistory.current.slice(-9),
        {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          timestamp: Date.now(),
        },
      ];
    }
  }, [reactFlowInstance]);
  
  // Apply a saved state
  const applyState = useCallback((state: { nodes: Node[]; edges: Edge[] }) => {
    if (reactFlowInstance) {
      reactFlowInstance.setNodes(state.nodes);
      reactFlowInstance.setEdges(state.edges);
    }
  }, [reactFlowInstance]);
  
  // Forward declaration for executeCanvasOperation
  const executeCanvasOperation = useCallback(async (
    operation: string,
    args: any,
    shouldBroadcast = true
  ): Promise<any> => {
    if (!reactFlowInstance) {
      throw new Error('ReactFlow instance not available');
    }
    
    // Save state before destructive operations
    if (['canvas-delete-node', 'canvas-delete-edge', 'canvas-layout-nodes'].includes(operation)) {
      saveStateToHistory();
    }
    
    // Broadcast the action to other users if needed
    if (shouldBroadcast && channelRef.current && user?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'agent-action',
        payload: {
          operation,
          args,
          userId: user.id,
          userName: 'Agent',
        } as AgentActionPayload,
      });
    }
    
    switch (operation) {
      case 'canvas-add-node': {
        const nodeId = addNode(args.type, {
          position: args.position || { x: 100, y: 100 },
          data: args.data,
        });
        
        return { nodeId, success: true };
      }
      
      case 'canvas-connect-nodes': {
        const newEdge: Edge = {
          id: nanoid(),
          source: args.sourceNodeId,
          target: args.targetNodeId,
          sourceHandle: args.sourceHandle,
          targetHandle: args.targetHandle,
        };
        
        reactFlowInstance.addEdges(newEdge);
        return { edgeId: newEdge.id, success: true };
      }
      
      case 'canvas-update-node': {
        const nodes = reactFlowInstance.getNodes();
        const updatedNodes = nodes.map((node) => {
          if (node.id === args.nodeId) {
            return {
              ...node,
              data: { ...node.data, ...args.updates },
              position: args.updates.position || node.position,
            };
          }
          return node;
        });
        
        reactFlowInstance.setNodes(updatedNodes);
        return { success: true };
      }
      
      case 'canvas-delete-node': {
        const nodes = reactFlowInstance.getNodes();
        const edges = reactFlowInstance.getEdges();
        
        const filteredNodes = nodes.filter((n) => n.id !== args.nodeId);
        const filteredEdges = edges.filter(
          (e) => e.source !== args.nodeId && e.target !== args.nodeId
        );
        
        reactFlowInstance.setNodes(filteredNodes);
        reactFlowInstance.setEdges(filteredEdges);
        return { success: true };
      }
      
      case 'canvas-delete-edge': {
        const edges = reactFlowInstance.getEdges();
        const filteredEdges = edges.filter((e) => e.id !== args.edgeId);
        
        reactFlowInstance.setEdges(filteredEdges);
        return { success: true };
      }
      
      case 'canvas-layout-nodes': {
        // Implement auto-layout logic here
        // This is a simplified version
        const nodes = reactFlowInstance.getNodes();
        const layoutedNodes = nodes.map((node, index) => ({
          ...node,
          position: {
            x: args.layoutType === 'horizontal' ? index * 250 : 0,
            y: args.layoutType === 'horizontal' ? 0 : index * 150,
          },
        }));
        
        reactFlowInstance.setNodes(layoutedNodes);
        return { success: true };
      }
      
      default:
        throw new Error(`Unknown canvas operation: ${operation}`);
    }
  }, [reactFlowInstance, addNode, saveStateToHistory, user]);
  
  // Execute an action from another user
  const executeRemoteAction = useCallback(async (action: AgentActionPayload) => {
    try {
      await executeCanvasOperation(action.operation, action.args, false); // Don't broadcast again
      
      // Show notification
      toast.info(`${action.userName || 'Another user'} performed: ${action.operation.replace('canvas-', '').replace(/-/g, ' ')}`, {
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to execute remote action:', error);
    }
  }, [executeCanvasOperation]);
  
  // Set up Supabase channel for collaboration
  useEffect(() => {
    if (!projectId || !user?.id) return;
    
    const supabase = createClient();
    
    // Create a channel for this project
    const channel = supabase.channel(`project:${projectId}`)
      .on('broadcast', { event: 'agent-action' }, (payload) => {
        const action = payload.payload as AgentActionPayload;
        
        // Ignore our own actions
        if (action.userId === user.id) return;
        
        // Apply the action from another user
        executeRemoteAction(action);
      })
      .subscribe();
    
    channelRef.current = channel;
    
    return () => {
      channel.unsubscribe();
    };
  }, [projectId, user?.id, executeRemoteAction]);
  
  const getCanvasApi = useCallback(() => {
    if (!reactFlowInstance) return null;
    
    return {
      addNode: (nodeData: any) => executeCanvasOperation('canvas-add-node', nodeData),
      connectNodes: (edgeData: any) => executeCanvasOperation('canvas-connect-nodes', edgeData),
      updateNode: (nodeId: string, updates: any) => 
        executeCanvasOperation('canvas-update-node', { nodeId, updates }),
      deleteNode: (nodeId: string) => executeCanvasOperation('canvas-delete-node', { nodeId }),
      deleteEdge: (edgeId: string) => executeCanvasOperation('canvas-delete-edge', { edgeId }),
      layoutNodes: (options: any) => executeCanvasOperation('canvas-layout-nodes', options),
      getCanvasState: () => canvasState,
      getNextPosition: () => {
        const nodes = reactFlowInstance.getNodes();
        const maxX = Math.max(...nodes.map((n) => n.position.x), 0);
        const maxY = Math.max(...nodes.map((n) => n.position.y), 0);
        return { x: maxX + 250, y: maxY };
      },
      applyState: (state: { nodes: Node[]; edges: Edge[] }) => applyState(state),
      getLastState: () => {
        const lastState = canvasHistory.current[canvasHistory.current.length - 1];
        return lastState ? { nodes: lastState.nodes, edges: lastState.edges } : null;
      },
    };
  }, [reactFlowInstance, executeCanvasOperation, canvasState, applyState]);
  
  return {
    selectedNodes: selectedNodes.map(node => node.id),
    canvasState,
    executeCanvasOperation,
    getCanvasApi,
  };
}