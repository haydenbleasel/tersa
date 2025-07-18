import useSWR from 'swr';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import type { MCPServerConfig } from '@/lib/mastra/mcp';

interface UseMCPReturn {
  servers: MCPServerConfig[];
  isLoading: boolean;
  error: Error | null;
  updateServers: (servers: MCPServerConfig[]) => Promise<void>;
}

export function useMCP(): UseMCPReturn {
  const { user } = useUser();
  const supabase = createClient();
  
  const { data, error, isLoading, mutate } = useSWR(
    user ? `mcp-servers-${user.id}` : null,
    async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('mcp_servers')
        .eq('user_id', user!.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return (profile?.mcp_servers as MCPServerConfig[]) || [];
    }
  );
  
  const updateServers = async (servers: MCPServerConfig[]) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        mcp_servers: servers,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', user.id);
    
    if (error) {
      throw error;
    }
    
    // Update local cache
    await mutate(servers);
  };
  
  return {
    servers: data || [],
    isLoading,
    error,
    updateServers,
  };
}