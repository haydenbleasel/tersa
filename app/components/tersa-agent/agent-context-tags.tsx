'use client';

import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AgentContextTagsProps {
  nodeIds: string[];
  onRemove?: (nodeId: string) => void;
}

export function AgentContextTags({ nodeIds, onRemove }: AgentContextTagsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {nodeIds.map((nodeId) => (
        <Badge
          key={nodeId}
          variant="secondary"
          className="flex items-center gap-1 pl-2 pr-1 py-0.5"
        >
          <span className="text-xs">#{nodeId}</span>
          {onRemove && (
            <button
              onClick={() => onRemove(nodeId)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}