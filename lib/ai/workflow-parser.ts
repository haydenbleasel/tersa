import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Node, Edge } from '@xyflow/react';

interface ParsedWorkflow {
  nodes: Array<{
    type: string;
    label: string;
    content?: string;
    model?: string;
    connections?: string[];
  }>;
  layout: {
    type: 'linear' | 'branching' | 'parallel';
    direction: 'horizontal' | 'vertical';
  };
}

export async function parseWorkflowDescription(description: string): Promise<ParsedWorkflow> {
  const prompt = `
    Analyze this workflow description and extract the necessary nodes and their connections.
    
    Description: "${description}"
    
    Return a JSON object with:
    - nodes: array of nodes, each with:
      - type: one of [text, image, audio, video, code, tweet, transform]
      - label: descriptive name
      - content: initial content (if applicable)
      - model: AI model to use (if type is transform)
      - connections: array of labels this node should connect to
    - layout:
      - type: one of [linear, branching, parallel]
      - direction: one of [horizontal, vertical]
    
    Example response:
    {
      "nodes": [
        {
          "type": "text",
          "label": "Input Text",
          "content": "Enter your text here"
        },
        {
          "type": "transform",
          "label": "Summarize",
          "model": "gpt-4o",
          "connections": ["Input Text"]
        }
      ],
      "layout": {
        "type": "linear",
        "direction": "horizontal"
      }
    }
    
    Focus on creating a practical, efficient workflow.
  `;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.3,
    });

    // Parse the JSON response
    const parsed = JSON.parse(text) as ParsedWorkflow;
    return parsed;
  } catch (error) {
    console.error('Failed to parse workflow description:', error);
    
    // Return a simple fallback
    return {
      nodes: [{
        type: 'text',
        label: 'Input',
        content: description,
      }],
      layout: {
        type: 'linear',
        direction: 'horizontal',
      },
    };
  }
}

export function calculateWorkflowLayout(
  parsedWorkflow: ParsedWorkflow
): { nodes: Node[]; edges: Edge[] } {
  const { nodes: parsedNodes, layout } = parsedWorkflow;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Node spacing
  const horizontalSpacing = 300;
  const verticalSpacing = 150;
  
  // Create a map for node lookups
  const nodeMap = new Map<string, string>();
  
  // Position nodes based on layout type
  parsedNodes.forEach((parsedNode, index) => {
    const nodeId = `node-${index}`;
    nodeMap.set(parsedNode.label, nodeId);
    
    let position = { x: 0, y: 0 };
    
    if (layout.type === 'linear') {
      if (layout.direction === 'horizontal') {
        position = { x: index * horizontalSpacing, y: 0 };
      } else {
        position = { x: 0, y: index * verticalSpacing };
      }
    } else if (layout.type === 'branching') {
      // Simple branching layout - main path with branches
      const level = Math.floor(index / 3);
      const branchIndex = index % 3;
      
      if (layout.direction === 'horizontal') {
        position = {
          x: level * horizontalSpacing,
          y: (branchIndex - 1) * verticalSpacing,
        };
      } else {
        position = {
          x: (branchIndex - 1) * horizontalSpacing,
          y: level * verticalSpacing,
        };
      }
    } else if (layout.type === 'parallel') {
      // Parallel layout - multiple streams
      const stream = index % 2;
      const stepInStream = Math.floor(index / 2);
      
      if (layout.direction === 'horizontal') {
        position = {
          x: stepInStream * horizontalSpacing,
          y: stream * verticalSpacing * 2,
        };
      } else {
        position = {
          x: stream * horizontalSpacing * 2,
          y: stepInStream * verticalSpacing,
        };
      }
    }
    
    const node: Node = {
      id: nodeId,
      type: parsedNode.type,
      position,
      data: {
        label: parsedNode.label,
        content: parsedNode.content,
        model: parsedNode.model,
      },
    };
    
    nodes.push(node);
  });
  
  // Create edges based on connections
  parsedNodes.forEach((parsedNode, index) => {
    const sourceId = `node-${index}`;
    
    if (parsedNode.connections) {
      parsedNode.connections.forEach((targetLabel) => {
        const targetId = nodeMap.get(targetLabel);
        if (targetId) {
          edges.push({
            id: `edge-${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            type: 'animated',
          });
        }
      });
    } else if (index > 0 && layout.type === 'linear') {
      // Auto-connect linear workflows
      edges.push({
        id: `edge-${index}`,
        source: `node-${index - 1}`,
        target: sourceId,
        type: 'animated',
      });
    }
  });
  
  return { nodes, edges };
}