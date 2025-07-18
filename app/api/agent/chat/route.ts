import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTersaAgent } from '@/lib/mastra/agents/factory';
import { getCredits } from '@/app/actions/credits/get';
import { trackCreditUsage } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const contextStr = formData.get('context') as string;
    const files = formData.getAll('files') as File[];
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Check credits
    const creditsResult = await getCredits();
    if ('error' in creditsResult) {
      return NextResponse.json({ error: creditsResult.error }, { status: 500 });
    }
    
    if (creditsResult.credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }
    
    // Parse context
    const context = contextStr ? JSON.parse(contextStr) : {};
    
    // Get user profile for preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Create user-specific agent instance
    const tersaAgent = createTersaAgent(user.id);
    
    // Create runtime context for the agent
    const runtimeContext = new Map([
      ['user-id', user.id],
      ['user-tier', profile?.tier || 'basic'],
      ['model-preference', profile?.model_preference || 'openai'],
      ['canvas-state', context.canvasState || {}],
      ['canvas-api', {
        // These will be called from the client side
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
    
    // Generate response
    const response = await tersaAgent.generate({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      runtimeContext,
    });
    
    // Track credit usage
    const tokensUsed = response.usage?.totalTokens || 100;
    const creditCost = tokensUsed * 0.00001; // Approximate cost per token
    
    await trackCreditUsage({
      action: 'tersa-agent-chat',
      cost: creditCost,
    });
    
    return NextResponse.json({
      content: response.text,
      usage: response.usage,
      toolCalls: response.toolCalls,
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}