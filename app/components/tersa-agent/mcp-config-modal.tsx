'use client';

import { useState, useEffect } from 'react';
import { useMCP } from '@/lib/hooks/use-mcp';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Server, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const mcpServerSchema = z.object({
  servers: z.array(z.object({
    url: z.string().url('Please enter a valid URL'),
    key: z.string().optional(),
  })),
});

type MCPServerForm = z.infer<typeof mcpServerSchema>;

interface MCPConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MCPConfigModal({ open, onOpenChange }: MCPConfigModalProps) {
  const { servers, isLoading, error, updateServers } = useMCP();
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<MCPServerForm>({
    resolver: zodResolver(mcpServerSchema),
    defaultValues: {
      servers: servers.length > 0 ? servers : [{ url: '', key: '' }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'servers',
  });
  
  // Update form when servers load
  useEffect(() => {
    if (servers.length > 0) {
      form.reset({ servers });
    }
  }, [servers, form]);
  
  const onSubmit = async (data: MCPServerForm) => {
    setIsSaving(true);
    try {
      await updateServers(data.servers);
      toast.success('MCP servers updated successfully', {
        description: 'Your tools will be available in the next chat session',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update MCP servers', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Configure MCP Tools
          </DialogTitle>
          <DialogDescription>
            Add Model Context Protocol (MCP) servers to extend Tersa Agent with custom tools.
            These servers can provide additional capabilities like database access, API integrations, and more.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <FormField
                        control={form.control}
                        name={`servers.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Server URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://mcp-server.example.com"
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`servers.${index}.key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key (optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Optional authentication key"
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormDescription>
                              Some servers require authentication
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="ml-2 mt-7"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ url: '', key: '' })}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Server
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
        
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{error.message}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}