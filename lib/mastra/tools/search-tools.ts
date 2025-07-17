import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for information',
  inputSchema: z.object({
    query: z.string(),
    maxResults: z.number().default(5),
    searchType: z.enum(['general', 'news', 'academic', 'code']).default('general'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
      relevanceScore: z.number(),
    })),
  }),
  execute: async ({ context }) => {
    // For now, we'll return mock results. In production, this would call a search API
    // like Serper, Tavily, or similar
    const mockResults = [
      {
        title: `Results for: ${context.query}`,
        url: `https://example.com/search?q=${encodeURIComponent(context.query)}`,
        snippet: `This is a mock search result for "${context.query}". In production, this would return real search results.`,
        relevanceScore: 0.95,
      },
    ];
    
    return {
      results: mockResults.slice(0, context.maxResults),
    };
  },
});

export const searchDocumentationTool = createTool({
  id: 'search-documentation',
  description: 'Search AI provider documentation for specific information',
  inputSchema: z.object({
    provider: z.enum(['openai', 'anthropic', 'google', 'aws', 'groq', 'deepseek']),
    query: z.string(),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
      section: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    // Mock implementation - would integrate with documentation APIs
    const docUrls: Record<string, string> = {
      openai: 'https://platform.openai.com/docs',
      anthropic: 'https://docs.anthropic.com',
      google: 'https://cloud.google.com/vertex-ai/docs',
      aws: 'https://docs.aws.amazon.com/bedrock',
      groq: 'https://console.groq.com/docs',
      deepseek: 'https://platform.deepseek.com/docs',
    };
    
    return {
      results: [{
        title: `${context.provider} Documentation: ${context.query}`,
        url: docUrls[context.provider],
        content: `Documentation content for ${context.query} in ${context.provider}`,
        section: 'API Reference',
      }],
    };
  },
});

export const searchWorkflowsTool = createTool({
  id: 'search-workflows',
  description: 'Search saved workflows by name, tags, or content',
  inputSchema: z.object({
    query: z.string(),
    filters: z.object({
      tags: z.array(z.string()).optional(),
      createdAfter: z.string().optional(),
      createdBefore: z.string().optional(),
      modifiedAfter: z.string().optional(),
      nodeTypes: z.array(z.string()).optional(),
    }).optional(),
    limit: z.number().default(10),
  }),
  outputSchema: z.object({
    workflows: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()),
      nodeCount: z.number(),
      createdAt: z.string(),
      modifiedAt: z.string(),
      relevanceScore: z.number(),
    })),
  }),
  execute: async ({ context, runtimeContext }) => {
    const canvasApi = runtimeContext?.get('canvas-api');
    if (!canvasApi) throw new Error('Canvas API not available');
    
    const results = await canvasApi.searchWorkflows(context);
    
    return { workflows: results };
  },
});

export const searchNodeTemplatesTool = createTool({
  id: 'search-node-templates',
  description: 'Search for node templates and examples',
  inputSchema: z.object({
    nodeType: z.enum(['text', 'image', 'audio', 'video', 'code', 'tweet', 'transform']),
    useCase: z.string().optional(),
  }),
  outputSchema: z.object({
    templates: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      nodeType: z.string(),
      data: z.any(),
      exampleUsage: z.string().optional(),
    })),
  }),
  execute: async ({ context }) => {
    // Return common templates based on node type
    const templates = {
      text: [
        {
          id: 'text-prompt',
          name: 'AI Prompt Template',
          description: 'A template for creating effective AI prompts',
          nodeType: 'text',
          data: {
            label: 'AI Prompt',
            content: 'You are a helpful assistant. Please...',
          },
          exampleUsage: 'Use this as a starting point for AI interactions',
        },
      ],
      code: [
        {
          id: 'code-python',
          name: 'Python Script Template',
          description: 'Basic Python script structure',
          nodeType: 'code',
          data: {
            label: 'Python Script',
            content: '# Python script\\n\\ndef main():\\n    pass\\n\\nif __name__ == "__main__":\\n    main()',
            language: 'python',
          },
          exampleUsage: 'Starting point for Python data processing',
        },
      ],
      transform: [
        {
          id: 'transform-gpt4',
          name: 'GPT-4 Transform',
          description: 'General purpose AI transformation',
          nodeType: 'transform',
          data: {
            label: 'GPT-4 Transform',
            model: 'gpt-4',
          },
          exampleUsage: 'Connect to any input for AI processing',
        },
      ],
    };
    
    return {
      templates: templates[context.nodeType] || [],
    };
  },
});