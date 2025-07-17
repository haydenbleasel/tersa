import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tersaAgent } from '@/lib/mastra';

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
    
    // TODO: Implement credit checking
    // const credits = await getCredits(user.id);
    // if (credits < 1) {
    //   return new Response('Insufficient credits', { status: 402 });
    // }
    
    // Get user profile for preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
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
        const response = await tersaAgent.stream({
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
          runtimeContext,
        });
        
        for await (const chunk of response) {
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
        
        // Send completion signal
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        
        // TODO: Implement credit deduction
        // const tokensUsed = 100; // Estimate for now
        // const creditCost = Math.ceil(tokensUsed / 1000);
        // await deductCredits(user.id, creditCost);
        
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