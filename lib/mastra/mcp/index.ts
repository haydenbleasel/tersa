import { MCPClient } from '@mastra/mcp';

export interface MCPServerConfig {
  url: string;
  key?: string;
}

/**
 * Creates an MCP client and fetches available tools from configured servers
 */
export async function getMCPTools(runtimeContext: Map<string, any>) {
  const mcpServers = runtimeContext?.get('mcpServers') as MCPServerConfig[] || [];
  
  if (mcpServers.length === 0) {
    return {};
  }
  
  const mcpTools: Record<string, any> = {};
  
  for (const server of mcpServers) {
    try {
      const client = new MCPClient({
        url: server.url,
        apiKey: server.key,
      } as any);
      
      // Connect and fetch available tools
      await (client as any).connect?.();
      const tools = await (client as any).listTools?.() || [];
      
      // Transform MCP tools to Mastra tool format
      for (const tool of tools) {
        mcpTools[`mcp_${tool.name}`] = {
          description: tool.description,
          parameters: tool.inputSchema,
          execute: async (params: any) => {
            return await (client as any).callTool?.(tool.name, params);
          },
        };
      }
      
      await (client as any).disconnect?.();
    } catch (error) {
      console.error(`Failed to connect to MCP server ${server.url}:`, error);
    }
  }
  
  return mcpTools;
}

/**
 * Dynamic tools provider that combines static tools with MCP tools
 */
export async function getDynamicTools(
  staticTools: Record<string, any>,
  runtimeContext: Map<string, any>
): Promise<Record<string, any>> {
  const mcpTools = await getMCPTools(runtimeContext);
  
  return {
    ...staticTools,
    ...mcpTools,
  };
}