import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTersaAgent } from '@/lib/mastra/agents/factory';
import { getCredits } from '@/app/actions/credits/get';
import { trackCreditUsage } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    const { message, context, userId } = body;
    
    if (!message) {
      return new Response('Message is required', { status: 400 });
    }
    
    // Check credits
    const creditsResult = await getCredits();
    if ('error' in creditsResult) {
      return new Response(creditsResult.error, { status: 500 });
    }
    
    if (creditsResult.credits < 1) {
      return new Response('Insufficient credits', { status: 402 });
    }
    
    // Get user profile for preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Create user-specific agent instance
    const tersaAgent = createTersaAgent(user.id);
    
    // Create runtime context
    const runtimeContext = new Map([
      ['user-id', user.id],
      ['user-tier', profile?.tier || 'basic'],
      ['model-preference', profile?.model_preference || 'openai'],
      ['canvas-state', context.canvasState || {}],
      ['canvas-api', {
        // Placeholder implementations - actual calls will be made client-side
        addNode: async (nodeData: any) => ({ nodeId: 'temp-id', success: true }),
        connectNodes: async (edgeData: any) => ({ edgeId: 'temp-id', success: true }),
        updateNode: async (nodeId: string, updates: any) => ({ success: true }),
        deleteNode: async (nodeId: string) => ({ success: true }),
        deleteEdge: async (edgeId: string) => ({ success: true }),
        layoutNodes: async (options: any) => ({ success: true }),
        getCanvasState: async () => context.canvasState || { nodes: [], edges: [] },
        getNextPosition: () => ({ x: 100, y: 100 }),
      }],
    ]);
    
    // Create a TransformStream for SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start streaming in the background
    (async () => {
      try {
        const response = await tersaAgent.stream(
          [
            {
              role: 'user',
              content: message,
            },
          ]
        );
        
        // Handle streaming response
        if (response) {
          // Try to iterate over the response if it's an async iterable
          try {
            // Type assertion to handle the async iterator
            const asyncResponse = response as unknown as AsyncIterable<any>;
            for await (const chunk of asyncResponse) {
              if (chunk.type === 'text-delta') {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', text: chunk.text })}\n\n`)
                );
              } else if (chunk.type === 'tool-call') {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ 
                    type: 'tool-call', 
                    toolName: chunk.toolName,
                    args: chunk.args 
                  })}\n\n`)
                );
              }
            }
          } catch (iterError) {
            // If not async iterable, try other methods
            const streamResponse = response as any;
            if (streamResponse?.textStream) {
              const reader = streamResponse.textStream.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Write the raw text chunks
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', text: value })}\n\n`)
                );
              }
            } else {
              // Fallback: treat as a single response
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', text: String(response) })}\n\n`)
              );
            }
          }
        }
        
        // Send completion signal
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        
        // Track credit usage (estimate for streaming)
        const tokensUsed = 500; // Estimate for streaming response
        const creditCost = tokensUsed * 0.00001;
        
        await trackCreditUsage({
          action: 'tersa-agent-stream',
          cost: creditCost,
        });
        
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream error' })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();
    
    // Return SSE response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Agent stream error:', error);
    return new Response('Failed to start stream', { status: 500 });
  }
}