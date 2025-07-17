'use client';

import { useState, useRef, useEffect } from 'react';
import { useTersaAgent } from '@/lib/hooks/use-tersa-agent';
import { useCanvasBridge } from '@/lib/hooks/use-canvas-bridge';
import { AgentPromptInput } from './agent-prompt-input';
import { AgentStreaming } from './agent-streaming';
import { AgentContextTags } from './agent-context-tags';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles, Minimize2, Maximize2, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: File[];
  taggedNodes?: string[];
  timestamp: Date;
}

interface AgentChatProps {
  mode: 'overlay' | 'sidebar' | 'modal';
  onModeChange: (mode: 'overlay' | 'sidebar' | 'modal') => void;
  onClose: () => void;
}

export function AgentChat({ mode, onModeChange, onClose }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [taggedNodes, setTaggedNodes] = useState<string[]>([]);
  
  const { generateResponse, streamResponse } = useTersaAgent();
  const { selectedNodes, canvasState, executeCanvasOperation } = useCanvasBridge();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (content: string, files?: File[]) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      files,
      taggedNodes,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    
    try {
      const stream = await streamResponse({
        message: content,
        files,
        context: {
          selectedNodes,
          taggedNodes,
          canvasState,
        },
      });
      
      let assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      for await (const chunk of stream) {
        if (chunk.type === 'text-delta') {
          assistantMessage.content += chunk.text;
          setMessages((prev) => 
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: assistantMessage.content }
                : msg
            )
          );
        } else if (chunk.type === 'tool-call') {
          // Handle canvas operations
          if (chunk.toolName.startsWith('canvas-')) {
            await executeCanvasOperation(chunk.toolName, chunk.args);
          }
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsStreaming(false);
      setTaggedNodes([]);
    }
  };
  
  return (
    <Card
      className={cn(
        'flex flex-col bg-background/95 backdrop-blur-sm border shadow-lg',
        mode === 'overlay' && 'fixed bottom-4 right-4 w-96 h-[500px] z-50',
        mode === 'sidebar' && 'fixed top-0 right-0 w-[400px] h-full z-40',
        mode === 'modal' && 'fixed inset-4 max-w-4xl mx-auto z-50'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Tersa Agent</h3>
        </div>
        <div className="flex items-center gap-1">
          {mode === 'overlay' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onModeChange('sidebar')}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          {mode === 'sidebar' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onModeChange('overlay')}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] p-3 rounded-lg',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <AgentStreaming content={message.content} />
              {message.taggedNodes && message.taggedNodes.length > 0 && (
                <div className="mt-2">
                  <AgentContextTags nodeIds={message.taggedNodes} />
                </div>
              )}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        {selectedNodes.length > 0 && (
          <div className="mb-2">
            <AgentContextTags
              nodeIds={selectedNodes}
              onRemove={(nodeId) => {
                setTaggedNodes((prev) => prev.filter((id) => id !== nodeId));
              }}
            />
          </div>
        )}
        <AgentPromptInput
          onSend={handleSendMessage}
          onTagNodes={setTaggedNodes}
          disabled={isStreaming}
          placeholder={
            mode === 'overlay'
              ? 'Quick command...'
              : 'Describe what you want to build...'
          }
        />
      </div>
    </Card>
  );
}