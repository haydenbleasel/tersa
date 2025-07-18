'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentStreamingProps {
  content: string;
  isStreaming?: boolean;
  showReasoning?: boolean;
}

export function AgentStreaming({ content, isStreaming = false, showReasoning = false }: AgentStreamingProps) {
  const [displayContent, setDisplayContent] = useState(content);
  const [reasoning, setReasoning] = useState<string[]>([]);
  
  useEffect(() => {
    // Parse content for reasoning blocks
    const reasoningRegex = /\[reasoning\]([\s\S]*?)\[\/reasoning\]/g;
    const matches = [...content.matchAll(reasoningRegex)];
    
    if (matches.length > 0 && showReasoning) {
      const reasoningSteps = matches.map(match => match[1].trim());
      setReasoning(reasoningSteps);
      
      // Remove reasoning blocks from display content
      const cleanContent = content.replace(reasoningRegex, '');
      setDisplayContent(cleanContent);
    } else {
      setDisplayContent(content);
    }
  }, [content, showReasoning]);
  
  return (
    <div className="space-y-2">
      {reasoning.length > 0 && showReasoning && (
        <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/20 rounded">
          <div className="font-medium">Reasoning:</div>
          {reasoning.map((step, index) => (
            <div key={index} className="ml-2">
              • {step}
            </div>
          ))}
        </div>
      )}
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              return (
                <code 
                  className={className || (inline ? '' : 'block bg-gray-100 dark:bg-gray-800 p-2 rounded')} 
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {displayContent}
        </ReactMarkdown>
        {isStreaming && <span className="animate-pulse">▊</span>}
      </div>
    </div>
  );
}