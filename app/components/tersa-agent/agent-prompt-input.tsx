'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Paperclip, 
  X, 
  FileText, 
  Image, 
  Code, 
  Hash 
} from 'lucide-react';

interface AgentPromptInputProps {
  onSend: (content: string, files?: File[]) => void;
  onTagNodes?: (nodeIds: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AgentPromptInput({ 
  onSend, 
  onTagNodes, 
  disabled = false,
  placeholder = 'Ask me anything...'
}: AgentPromptInputProps) {
  const [content, setContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setAttachedFiles((prev) => [...prev, ...acceptedFiles]);
    },
    noClick: true,
    noKeyboard: true,
  });
  
  const handleSend = () => {
    if (content.trim() || attachedFiles.length > 0) {
      onSend(content.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
      setContent('');
      setAttachedFiles([]);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.includes('javascript') || file.type.includes('typescript')) return <Code className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };
  
  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <p className="text-sm text-muted-foreground">Drop files here...</p>
        </div>
      )}
      
      <div className="space-y-2">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-background rounded text-sm"
              >
                {getFileIcon(file)}
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[44px] max-h-[200px] resize-none pr-10"
              rows={1}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 bottom-1 h-8 w-8"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                }
              }}
            />
          </div>
          
          <Button
            size="icon"
            onClick={handleSend}
            disabled={disabled || (!content.trim() && attachedFiles.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tip:</span>
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            Tag nodes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            Attach files
          </span>
          <span>•</span>
          <span>Drag & drop supported</span>
        </div>
      </div>
    </div>
  );
}