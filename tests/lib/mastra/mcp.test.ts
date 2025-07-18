import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMCPTools, getDynamicTools } from '@/lib/mastra/mcp';
import { MCPClient } from '@mastra/mcp';

// Mock MCP client
vi.mock('@mastra/mcp', () => ({
  MCPClient: vi.fn(),
}));

describe('MCP Integration', () => {
  const mockConnect = vi.fn();
  const mockListTools = vi.fn();
  const mockCallTool = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (MCPClient as any).mockImplementation(() => ({
      connect: mockConnect,
      listTools: mockListTools,
      callTool: mockCallTool,
      disconnect: mockDisconnect,
    }));
  });

  describe('getMCPTools', () => {
    it('should return empty object when no servers configured', async () => {
      const runtimeContext = new Map();
      const tools = await getMCPTools(runtimeContext);
      
      expect(tools).toEqual({});
      expect(MCPClient).not.toHaveBeenCalled();
    });

    it('should fetch tools from configured servers', async () => {
      const mockTools = [
        {
          name: 'search',
          description: 'Search the web',
          inputSchema: { query: { type: 'string' } },
        },
        {
          name: 'calculate',
          description: 'Perform calculations',
          inputSchema: { expression: { type: 'string' } },
        },
      ];
      
      mockListTools.mockResolvedValue(mockTools);
      
      const runtimeContext = new Map([
        ['mcpServers', [
          { url: 'http://localhost:3000', key: 'test-key' },
        ]],
      ]);
      
      const tools = await getMCPTools(runtimeContext);
      
      expect(MCPClient).toHaveBeenCalledWith({
        url: 'http://localhost:3000',
        apiKey: 'test-key',
      });
      
      expect(mockConnect).toHaveBeenCalled();
      expect(mockListTools).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalled();
      
      expect(tools).toHaveProperty('mcp_search');
      expect(tools).toHaveProperty('mcp_calculate');
      
      expect(tools.mcp_search.description).toBe('Search the web');
      expect(tools.mcp_calculate.description).toBe('Perform calculations');
    });

    it('should handle connection errors gracefully', async () => {
      mockConnect.mockRejectedValue(new Error('Connection failed'));
      
      const runtimeContext = new Map([
        ['mcpServers', [
          { url: 'http://localhost:3000' },
        ]],
      ]);
      
      const tools = await getMCPTools(runtimeContext);
      
      expect(tools).toEqual({});
      expect(mockConnect).toHaveBeenCalled();
    });

    it('should execute MCP tools correctly', async () => {
      const mockTools = [
        {
          name: 'search',
          description: 'Search the web',
          inputSchema: { query: { type: 'string' } },
        },
      ];
      
      mockListTools.mockResolvedValue(mockTools);
      mockCallTool.mockResolvedValue({ results: ['Result 1', 'Result 2'] });
      
      const runtimeContext = new Map([
        ['mcpServers', [
          { url: 'http://localhost:3000' },
        ]],
      ]);
      
      const tools = await getMCPTools(runtimeContext);
      const searchTool = tools.mcp_search;
      
      const result = await searchTool.execute({ query: 'test search' });
      
      expect(mockCallTool).toHaveBeenCalledWith('search', { query: 'test search' });
      expect(result).toEqual({ results: ['Result 1', 'Result 2'] });
    });
  });

  describe('getDynamicTools', () => {
    it('should combine static and MCP tools', async () => {
      const staticTools = {
        staticTool1: { description: 'Static tool 1' },
        staticTool2: { description: 'Static tool 2' },
      };
      
      const mockTools = [
        {
          name: 'dynamic',
          description: 'Dynamic MCP tool',
          inputSchema: {},
        },
      ];
      
      mockListTools.mockResolvedValue(mockTools);
      
      const runtimeContext = new Map([
        ['mcpServers', [
          { url: 'http://localhost:3000' },
        ]],
      ]);
      
      const allTools = await getDynamicTools(staticTools, runtimeContext);
      
      expect(allTools).toHaveProperty('staticTool1');
      expect(allTools).toHaveProperty('staticTool2');
      expect(allTools).toHaveProperty('mcp_dynamic');
      
      expect(Object.keys(allTools).length).toBe(3);
    });

    it('should return only static tools when MCP fails', async () => {
      const staticTools = {
        staticTool1: { description: 'Static tool 1' },
      };
      
      mockConnect.mockRejectedValue(new Error('Failed'));
      
      const runtimeContext = new Map([
        ['mcpServers', [
          { url: 'http://localhost:3000' },
        ]],
      ]);
      
      const allTools = await getDynamicTools(staticTools, runtimeContext);
      
      expect(allTools).toEqual(staticTools);
      expect(Object.keys(allTools).length).toBe(1);
    });
  });
});