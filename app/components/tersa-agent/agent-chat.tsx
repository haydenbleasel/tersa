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
import { Sparkles, Minimize2, Maximize2, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{
    messageId: string;
    toolName: string;
    args: any;
    resolve: () => void;
  } | null>(null);
  
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
        } else if (chunk.type === 'tool-call' && chunk.toolName) {
          // Handle canvas operations with visual feedback
          if (chunk.toolName.startsWith('canvas-')) {
            // Check if this is a destructive operation that needs confirmation
            const needsConfirm = ['canvas-delete-node', 'canvas-delete-edge'].includes(chunk.toolName);
            
            if (needsConfirm) {
              // Pause the stream and wait for approval
              await new Promise<void>((resolve) => {
                setPendingApproval({
                  messageId: assistantMessage.id,
                  toolName: chunk.toolName || '',
                  args: chunk.args,
                  resolve,
                });
                
                // Update the message to show approval request
                const actionName = (chunk.toolName || '').replace('canvas-', '').replace(/-/g, ' ');
                assistantMessage.content += `\n\n⚠️ **Approval Required**: This action will ${actionName}. Please confirm to proceed.`;
                setMessages((prev) => 
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                );
              });
            } else {
              setIsExecutingAction(true);
              
              // Show toast for the action
              const actionName = chunk.toolName.replace('canvas-', '').replace(/-/g, ' ');
              toast.info(`Executing: ${actionName}`, {
                icon: <Zap className="h-4 w-4" />,
                duration: 2000,
              });
              
              try {
                await executeCanvasOperation(chunk.toolName, chunk.args);
                
                // Add a small delay for visual effect
                await new Promise(resolve => setTimeout(resolve, 500));
              } finally {
                setIsExecutingAction(false);
              }
            }
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
  
  const handleApproval = async (approved: boolean) => {
    if (!pendingApproval) return;
    
    const { messageId, toolName, args, resolve } = pendingApproval;
    setPendingApproval(null);
    
    if (approved) {
      setIsExecutingAction(true);
      
      // Show toast for the action
      const actionName = toolName.replace('canvas-', '').replace(/-/g, ' ');
      toast.info(`Executing: ${actionName}`, {
        icon: <Zap className="h-4 w-4" />,
        duration: 2000,
      });
      
      try {
        await executeCanvasOperation(toolName, args);
        
        // Update the message to show it was approved
        setMessages((prev) => 
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: msg.content.replace(/⚠️ \*\*Approval Required\*\*:.*$/, '✅ Action approved and executed.') }
              : msg
          )
        );
        
        // Add a small delay for visual effect
        await new Promise(r => setTimeout(r, 500));
      } finally {
        setIsExecutingAction(false);
      }
    } else {
      // Update the message to show it was rejected
      setMessages((prev) => 
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: msg.content.replace(/⚠️ \*\*Approval Required\*\*:.*$/, '❌ Action rejected by user.') }
            : msg
        )
      );
    }
    
    // Resume the stream
    resolve();
  };
  
  return (
    <Card
      className={cn(
        'flex flex-col bg-background/95 backdrop-blur-sm border shadow-lg transition-all duration-300 ease-in-out',
        mode === 'overlay' && 'fixed bottom-4 right-4 w-96 h-[500px] z-50 animate-in slide-in-from-bottom-2 fade-in-0',
        mode === 'sidebar' && 'fixed top-0 right-0 w-[400px] h-full z-40 animate-in slide-in-from-right',
        mode === 'modal' && 'fixed inset-4 max-w-4xl mx-auto z-50 animate-in zoom-in-95 fade-in-0',
        // Mobile responsive
        'max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:h-[80vh] max-sm:rounded-t-xl max-sm:rounded-b-none'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className={cn("h-5 w-5 text-primary", isExecutingAction && "animate-pulse")} />
          <h3 className="font-semibold">Tersa Agent</h3>
          {isExecutingAction && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Executing action...
            </span>
          )}
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
              {pendingApproval && pendingApproval.messageId === message.id && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproval(true)}
                    disabled={isExecutingAction}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApproval(false)}
                    disabled={isExecutingAction}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
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