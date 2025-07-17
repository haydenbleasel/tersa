import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';

interface StreamChunk {
  type: 'text-delta' | 'tool-call' | 'error';
  text?: string;
  toolName?: string;
  args?: any;
}

interface GenerateOptions {
  message: string;
  files?: File[];
  context?: {
    selectedNodes?: string[];
    taggedNodes?: string[];
    canvasState?: any;
  };
}

export function useTersaAgent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const user = useUser();
  
  const generateResponse = useCallback(async (options: GenerateOptions) => {
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('message', options.message);
      formData.append('context', JSON.stringify(options.context || {}));
      
      if (options.files) {
        options.files.forEach((file) => {
          formData.append('files', file);
        });
      }
      
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate response');
      }
      
      return await response.json();
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  const streamResponse = useCallback(async function* (options: GenerateOptions) {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: options.message,
          context: options.context || {},
          userId: user?.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to stream response');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed as StreamChunk;
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id]);
  
  return {
    generateResponse,
    streamResponse,
    isGenerating,
  };
}