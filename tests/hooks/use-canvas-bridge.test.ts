import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasBridge } from '@/lib/hooks/use-canvas-bridge';
import { useReactFlow } from '@xyflow/react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@/lib/hooks/use-user';

// Mock dependencies
vi.mock('@xyflow/react');
vi.mock('@supabase/auth-helpers-react');
vi.mock('@/lib/hooks/use-user');

describe('useCanvasBridge', () => {
  const mockGetNodes = vi.fn();
  const mockGetEdges = vi.fn();
  const mockAddNodes = vi.fn();
  const mockAddEdges = vi.fn();
  const mockDeleteElements = vi.fn();
  const mockUpdateNode = vi.fn();
  const mockGetIntersectingNodes = vi.fn();
  const mockScreenToFlowPosition = vi.fn();
  const mockProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useReactFlow as any).mockReturnValue({
      getNodes: mockGetNodes,
      getEdges: mockGetEdges,
      addNodes: mockAddNodes,
      addEdges: mockAddEdges,
      deleteElements: mockDeleteElements,
      updateNode: mockUpdateNode,
      getIntersectingNodes: mockGetIntersectingNodes,
      screenToFlowPosition: mockScreenToFlowPosition,
      project: mockProject,
    });

    (useSupabaseClient as any).mockReturnValue({
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
      }),
    });

    (useUser as any).mockReturnValue({
      user: { id: 'test-user-id' },
    });
  });

  it('should initialize with empty selected nodes', () => {
    const { result } = renderHook(() => useCanvasBridge('test-project'));
    expect(result.current.selectedNodes).toEqual([]);
  });

  it('should add a node via executeCanvasOperation', async () => {
    mockGetNodes.mockReturnValue([]);
    mockScreenToFlowPosition.mockReturnValue({ x: 100, y: 100 });
    
    const { result } = renderHook(() => useCanvasBridge('test-project'));
    
    await act(async () => {
      await result.current.executeCanvasOperation('canvas-add-node', {
        type: 'text',
        data: { label: 'Test Node' },
      });
    });

    expect(mockAddNodes).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'text',
        data: { label: 'Test Node' },
        position: { x: 100, y: 100 },
      }),
    ]);
  });

  it('should connect nodes via executeCanvasOperation', async () => {
    const { result } = renderHook(() => useCanvasBridge('test-project'));
    
    await act(async () => {
      await result.current.executeCanvasOperation('canvas-connect-nodes', {
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
      });
    });

    expect(mockAddEdges).toHaveBeenCalledWith([
      expect.objectContaining({
        source: 'node-1',
        target: 'node-2',
      }),
    ]);
  });

  it('should update node via executeCanvasOperation', async () => {
    const { result } = renderHook(() => useCanvasBridge('test-project'));
    
    await act(async () => {
      await result.current.executeCanvasOperation('canvas-update-node', {
        nodeId: 'node-1',
        updates: { label: 'Updated Label' },
      });
    });

    expect(mockUpdateNode).toHaveBeenCalledWith('node-1', expect.any(Function));
  });

  it('should delete node via executeCanvasOperation', async () => {
    const { result } = renderHook(() => useCanvasBridge('test-project'));
    
    await act(async () => {
      await result.current.executeCanvasOperation('canvas-delete-node', {
        nodeId: 'node-1',
      });
    });

    expect(mockDeleteElements).toHaveBeenCalledWith({ nodes: [{ id: 'node-1' }] });
  });

  it('should return canvas state', () => {
    const mockNodes = [{ id: 'node-1', type: 'text', data: {} }];
    const mockEdges = [{ id: 'edge-1', source: 'node-1', target: 'node-2' }];
    
    mockGetNodes.mockReturnValue(mockNodes);
    mockGetEdges.mockReturnValue(mockEdges);
    
    const { result } = renderHook(() => useCanvasBridge('test-project'));
    
    expect(result.current.canvasState).toEqual({
      nodes: mockNodes,
      edges: mockEdges,
    });
  });

  it('should rollback to previous state', async () => {
    const initialNodes = [{ id: 'node-1', type: 'text', data: {} }];
    const initialEdges = [{ id: 'edge-1', source: 'node-1', target: 'node-2' }];
    
    mockGetNodes.mockReturnValue(initialNodes);
    mockGetEdges.mockReturnValue(initialEdges);
    
    const { result } = renderHook(() => useCanvasBridge('test-project'));
    
    // First add a node to create history
    await act(async () => {
      await result.current.executeCanvasOperation('canvas-add-node', {
        type: 'text',
        data: { label: 'New Node' },
      });
    });

    // Then rollback
    await act(async () => {
      await result.current.executeCanvasOperation('canvas-rollback-last', {});
    });

    // Should restore the previous state
    expect(mockAddNodes).toHaveBeenCalledTimes(2); // Once for add, once for restore
  });
});