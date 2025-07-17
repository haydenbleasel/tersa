import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const parseDescriptionStep = createStep({
  id: 'parse-description',
  inputSchema: z.object({
    description: z.string(),
  }),
  outputSchema: z.object({
    nodes: z.array(z.object({
      type: z.string(),
      label: z.string(),
      content: z.string().optional(),
      connections: z.array(z.string()).optional(),
    })),
    layout: z.object({
      type: z.enum(['linear', 'branching', 'parallel']),
      direction: z.enum(['horizontal', 'vertical']),
    }),
  }),
  execute: async ({ inputData }) => {
    // Use AI to parse natural language into workflow structure
    const prompt = `
      Parse the following natural language description into a workflow structure.
      Extract the nodes needed and their connections.
      
      Description: ${inputData.description}
      
      Return a JSON object with:
      - nodes: array of nodes with type, label, content, and connections
      - layout: object with type (linear/branching/parallel) and direction (horizontal/vertical)
      
      Node types can be: text, image, audio, video, code, tweet, transform
    `;
    
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.3,
    });
    
    try {
      return JSON.parse(text);
    } catch {
      // Fallback structure
      return {
        nodes: [{
          type: 'text',
          label: 'Input',
          content: inputData.description,
        }],
        layout: {
          type: 'linear',
          direction: 'horizontal',
        },
      };
    }
  },
});

const generateLayoutStep = createStep({
  id: 'generate-layout',
  inputSchema: z.object({
    nodes: z.array(z.any()),
    layout: z.object({
      type: z.string(),
      direction: z.string(),
    }),
  }),
  outputSchema: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({ x: z.number(), y: z.number() }),
      data: z.any(),
    })),
    edges: z.array(z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    const { nodes, layout } = inputData;
    const nodeSpacing = layout.direction === 'horizontal' ? 250 : 150;
    const positionedNodes = [];
    const edges = [];
    
    // Calculate positions based on layout type
    nodes.forEach((node: any, index: number) => {
      const id = `node-${index}`;
      let position = { x: 0, y: 0 };
      
      if (layout.type === 'linear') {
        if (layout.direction === 'horizontal') {
          position = { x: index * nodeSpacing, y: 0 };
        } else {
          position = { x: 0, y: index * nodeSpacing };
        }
      } else if (layout.type === 'branching') {
        // Simple branching layout
        const level = Math.floor(index / 3);
        const indexInLevel = index % 3;
        position = {
          x: layout.direction === 'horizontal' ? level * nodeSpacing : indexInLevel * nodeSpacing,
          y: layout.direction === 'horizontal' ? indexInLevel * nodeSpacing : level * nodeSpacing,
        };
      } else if (layout.type === 'parallel') {
        // Parallel layout
        const row = index % 2;
        const col = Math.floor(index / 2);
        position = {
          x: layout.direction === 'horizontal' ? col * nodeSpacing : row * nodeSpacing,
          y: layout.direction === 'horizontal' ? row * nodeSpacing : col * nodeSpacing,
        };
      }
      
      positionedNodes.push({
        id,
        type: node.type,
        position,
        data: {
          label: node.label,
          content: node.content,
          model: node.type === 'transform' ? 'gpt-4o' : undefined,
        },
      });
      
      // Create edges based on connections
      if (node.connections && index > 0) {
        edges.push({
          id: `edge-${index}`,
          source: `node-${index - 1}`,
          target: id,
        });
      }
    });
    
    return { nodes: positionedNodes, edges };
  },
});

const validateWorkflowStep = createStep({
  id: 'validate-workflow',
  inputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
  outputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    valid: z.boolean(),
    issues: z.array(z.string()).optional(),
  }),
  execute: async ({ inputData }) => {
    const { nodes, edges } = inputData;
    const issues = [];
    
    // Basic validation
    if (nodes.length === 0) {
      issues.push('No nodes generated');
    }
    
    // Check for disconnected nodes
    const connectedNodeIds = new Set();
    edges.forEach((edge: any) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    nodes.forEach((node: any) => {
      if (nodes.length > 1 && !connectedNodeIds.has(node.id)) {
        issues.push(`Node ${node.id} is not connected`);
      }
    });
    
    return {
      nodes,
      edges,
      valid: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined,
    };
  },
});

export const nodeGenerationWorkflow = createWorkflow({
  id: 'generate-nodes-from-description',
  description: 'Generate workflow nodes from natural language',
  inputSchema: z.object({
    description: z.string(),
  }),
  outputSchema: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    valid: z.boolean(),
    issues: z.array(z.string()).optional(),
  }),
})
.then(parseDescriptionStep)
.then(generateLayoutStep)
.then(validateWorkflowStep)
.commit();