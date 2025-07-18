import { MCPClient } from '@mastra/mcp';
import type { RuntimeContext } from '@mastra/core';

export interface MCPServerConfig {
  url: string;
  key?: string;
}

/**
 * Creates an MCP client and fetches available tools from configured servers
 */
export async function getMCPTools(runtimeContext: RuntimeContext) {
  const mcpServers = runtimeContext?.get('mcpServers') as MCPServerConfig[] || [];
  
  if (mcpServers.length === 0) {
    return {};
  }
  
  const mcpTools: Record<string, any> = {};
  
  for (const server of mcpServers) {
    try {
      const client = new MCPClient({
        serverUrl: server.url,
        apiKey: server.key,
      });
      
      // Connect and fetch available tools
      await client.connect();
      const tools = await client.listTools();
      
      // Transform MCP tools to Mastra tool format
      for (const tool of tools) {
        mcpTools[`mcp_${tool.name}`] = {
          description: tool.description,
          parameters: tool.inputSchema,
          execute: async (params: any) => {
            return await client.callTool(tool.name, params);
          },
        };
      }
      
      await client.disconnect();
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
  runtimeContext: RuntimeContext
): Promise<Record<string, any>> {
  const mcpTools = await getMCPTools(runtimeContext);
  
  return {
    ...staticTools,
    ...mcpTools,
  };
}