import { useCallback, useEffect, useState } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useNodeOperations } from '@/providers/node-operations';

interface CanvasOperation {
  type: string;
  args: any;
}

export function useCanvasBridge() {
  const reactFlowInstance = useReactFlow();
  const { addNode } = useNodeOperations();
  const [canvasState, setCanvasState] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({ nodes: [], edges: [] });
  
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
  
  const executeCanvasOperation = useCallback(async (
    operation: string,
    args: any
  ) => {
    if (!reactFlowInstance) {
      throw new Error('ReactFlow instance not available');
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
  }, [reactFlowInstance]);
  
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
    };
  }, [reactFlowInstance, executeCanvasOperation, canvasState]);
  
  return {
    selectedNodes: selectedNodes.map(node => node.id),
    canvasState,
    executeCanvasOperation,
    getCanvasApi,
  };
}