'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentStreamingProps {
  content: string;
  isStreaming?: boolean;
}

export function AgentStreaming({ content, isStreaming = false }: AgentStreamingProps) {
  const [displayContent, setDisplayContent] = useState(content);
  
  useEffect(() => {
    setDisplayContent(content);
  }, [content]);
  
  return (
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
  );
}