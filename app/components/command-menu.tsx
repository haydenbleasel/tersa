'use client';

import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { AgentChat } from './tersa-agent';
import { 
  Sparkles, 
  Plus, 
  Save, 
  FolderOpen,
  Settings,
  HelpCircle,
  FileText,
  Zap,
  Server
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNodeOperations } from '@/providers/node-operations';
import { useSaveProject } from '@/hooks/use-save-project';
import { MCPConfigModal } from './tersa-agent/mcp-config-modal';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [showMCPConfig, setShowMCPConfig] = useState(false);
  const [agentMode, setAgentMode] = useState<'overlay' | 'sidebar' | 'modal'>('overlay');
  const router = useRouter();
  const { addNode } = useNodeOperations();
  const [saveState, setSaveState] = useSaveProject();
  const save = () => setSaveState(prev => ({ ...prev, isSaving: true }));
  
  // Open command menu with cmd+k
  useHotkeys('meta+k', () => setOpen(true), {
    preventDefault: true,
    enableOnContentEditable: false,
  });
  
  // Open agent directly with cmd+shift+k
  useHotkeys('meta+shift+k', () => {
    setOpen(false);
    setShowAgent(true);
  }, {
    preventDefault: true,
    enableOnContentEditable: false,
  });
  
  // Open MCP config with cmd+shift+m
  useHotkeys('meta+shift+m', () => {
    setOpen(false);
    setShowMCPConfig(true);
  }, {
    preventDefault: true,
    enableOnContentEditable: false,
  });
  
  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };
  
  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          {/* Sticky Tersa Agent option at top */}
          <CommandGroup>
            <CommandItem
              onSelect={() => runCommand(() => setShowAgent(true))}
              className="bg-primary/10 border border-primary/20"
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">Ask Tersa Agent</span>
              <CommandShortcut>⌘⇧K</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setShowMCPConfig(true))}
              className="bg-primary/5 border border-primary/10"
            >
              <Server className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">Configure MCP Tools</span>
              <CommandShortcut>⌘⇧M</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          {/* Node Operations */}
          <CommandGroup heading="Nodes">
            <CommandItem onSelect={() => runCommand(() => addNode('text'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Add Text Node</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => addNode('transform'))}>
              <Zap className="mr-2 h-4 w-4" />
              <span>Add Transform Node</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => addNode('drop'))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Empty Node</span>
            </CommandItem>
          </CommandGroup>
          
          {/* Project Operations */}
          <CommandGroup heading="Project">
            <CommandItem onSelect={() => runCommand(() => save())}>
              <Save className="mr-2 h-4 w-4" />
              <span>Save Project</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/projects'))}>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Open Projects</span>
            </CommandItem>
          </CommandGroup>
          
          {/* Settings & Help */}
          <CommandGroup heading="Other">
            <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.open('https://docs.tersa.ai', '_blank'))}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      
      {showAgent && (
        <AgentChat
          mode={agentMode}
          onModeChange={setAgentMode}
          onClose={() => setShowAgent(false)}
        />
      )}
      
      <MCPConfigModal
        open={showMCPConfig}
        onOpenChange={setShowMCPConfig}
      />
    </>
  );
}