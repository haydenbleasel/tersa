import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentChat } from '@/app/components/tersa-agent/agent-chat';
import { useTersaAgent } from '@/lib/hooks/use-tersa-agent';
import { useCanvasBridge } from '@/lib/hooks/use-canvas-bridge';

// Mock dependencies
vi.mock('@/lib/hooks/use-tersa-agent');
vi.mock('@/lib/hooks/use-canvas-bridge');
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AgentChat', () => {
  const mockGenerateResponse = vi.fn();
  const mockStreamResponse = vi.fn();
  const mockExecuteCanvasOperation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useTersaAgent as any).mockReturnValue({
      generateResponse: mockGenerateResponse,
      streamResponse: mockStreamResponse,
    });

    (useCanvasBridge as any).mockReturnValue({
      selectedNodes: [],
      canvasState: { nodes: [], edges: [] },
      executeCanvasOperation: mockExecuteCanvasOperation,
    });
  });

  it('should render in overlay mode', () => {
    render(
      <AgentChat 
        mode="overlay" 
        onModeChange={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Tersa Agent')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Quick command...')).toBeInTheDocument();
  });

  it('should render in sidebar mode', () => {
    render(
      <AgentChat 
        mode="sidebar" 
        onModeChange={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    
    expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();
  });

  it('should send a message when user submits', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { type: 'text-delta', text: 'Hello ' };
        yield { type: 'text-delta', text: 'world!' };
      },
    };
    
    mockStreamResponse.mockResolvedValue(mockStream);
    
    render(
      <AgentChat 
        mode="overlay" 
        onModeChange={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    
    const input = screen.getByPlaceholderText('Quick command...');
    fireEvent.change(input, { target: { value: 'Create a text node' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(mockStreamResponse).toHaveBeenCalledWith({
        message: 'Create a text node',
        files: undefined,
        context: {
          selectedNodes: [],
          taggedNodes: [],
          canvasState: { nodes: [], edges: [] },
        },
      });
    });
  });

  it('should display streaming responses', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { type: 'text-delta', text: 'Creating ' };
        yield { type: 'text-delta', text: 'a node...' };
      },
    };
    
    mockStreamResponse.mockResolvedValue(mockStream);
    
    render(
      <AgentChat 
        mode="overlay" 
        onModeChange={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    
    const input = screen.getByPlaceholderText('Quick command...');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('Creating a node...')).toBeInTheDocument();
    });
  });

  it('should show approval dialog for destructive operations', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { 
          type: 'tool-call', 
          toolName: 'canvas-delete-node',
          args: { nodeId: 'node-1' },
        };
      },
    };
    
    mockStreamResponse.mockResolvedValue(mockStream);
    
    render(
      <AgentChat 
        mode="overlay" 
        onModeChange={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    
    const input = screen.getByPlaceholderText('Quick command...');
    fireEvent.change(input, { target: { value: 'Delete node' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText(/Approval Required/)).toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });
  });

  it('should execute canvas operation on approval', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { 
          type: 'tool-call', 
          toolName: 'canvas-delete-node',
          args: { nodeId: 'node-1' },
        };
      },
    };
    
    mockStreamResponse.mockResolvedValue(mockStream);
    
    render(
      <AgentChat 
        mode="overlay" 
        onModeChange={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    
    const input = screen.getByPlaceholderText('Quick command...');
    fireEvent.change(input, { target: { value: 'Delete node' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Approve'));
    
    await waitFor(() => {
      expect(mockExecuteCanvasOperation).toHaveBeenCalledWith(
        'canvas-delete-node',
        { nodeId: 'node-1' }
      );
    });
  });

  it('should switch between modes', () => {
    const mockOnModeChange = vi.fn();
    
    render(
      <AgentChat 
        mode="overlay" 
        onModeChange={mockOnModeChange} 
        onClose={vi.fn()} 
      />
    );
    
    // Find maximize button
    const maximizeButton = screen.getByRole('button', { name: /maximize/i });
    fireEvent.click(maximizeButton);
    
    expect(mockOnModeChange).toHaveBeenCalledWith('sidebar');
  });

  it('should close when close button is clicked', () => {
    const mockOnClose = vi.fn();
    
    render(
      <AgentChat 
        mode="overlay" 
        onModeChange={vi.fn()} 
        onClose={mockOnClose} 
      />
    );
    
    // Find close button by looking for X icon
    const closeButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg')?.classList.contains('lucide-x')
    );
    
    fireEvent.click(closeButton!);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});