import { Canvas } from '@/components/canvas';
import type { Edge, Node } from '@xyflow/react';

const nodes: Node[] = [
  {
    id: 'primitive-1',
    type: 'code',
    position: { x: 0, y: 0 },
    data: {
      source: 'primitive',
      content: {
        text: "export const getTextFromTextNodes = (nodes) => {\n  return nodes\n    .filter((node) => node.type === 'text')\n    .map((node) => node.data.text)\n    .filter(Boolean)\n    .join('\\n');\n};",
        language: 'javascript',
      },
    },
    origin: [0, 0.5],
    measured: { width: 400, height: 200 },
    width: 400,
    height: 200,
  },
  {
    id: 'transform-1',
    type: 'code',
    position: { x: 600, y: 0 },
    data: {
      source: 'transform',
      generated: {
        text: "import { getTextFromTextNodes } from './your-file';\n\ndescribe('getTextFromTextNodes', () => {\n  it('should return text from text nodes', () => {\n    const nodes = [\n      { type: 'text', data: { text: 'Hello' } },\n      { type: 'image', data: { url: 'image.jpg' } },\n      { type: 'text', data: { text: 'World' } }\n    ];\n\n    const result = getTextFromTextNodes(nodes);\n    expect(result).toEqual('Hello\\nWorld');\n  });\n\n  it('should return empty string for non-text nodes', () => {\n    const nodes = [\n      { type: 'image', data: { url: 'image.jpg' } }\n    ];\n\n    const result = getTextFromTextNodes(nodes);\n    expect(result).toEqual('');\n  });\n\n  it('should ignore nodes without text', () => {\n    const nodes = [\n      { type: 'text', data: { text: '' } },\n      { type: 'text', data: { text: 'Hello' } }\n    ];\n\n    const result = getTextFromTextNodes(nodes);\n    expect(result).toEqual('Hello');\n  });\n});",
        language: 'javascript',
      },
      instructions: 'Write unit tests.',
    },
    origin: [0, 0.5],
    measured: { width: 400, height: 400 },
    width: 400,
    height: 400,
  },
];

const edges: Edge[] = [
  {
    id: 'edge-1',
    source: 'primitive-1',
    target: 'transform-1',
    type: 'animated',
  },
];

export const CodeDemo = () => (
  <Canvas
    projects={[]}
    data={{
      createdAt: new Date(),
      id: 'code-demo',
      name: 'Demo Project',
      userId: 'test',
      transcriptionModel: 'gpt-4o-mini-transcribe',
      visionModel: 'gpt-4.1-nano',
      updatedAt: null,
      image: null,
      content: {
        nodes,
        edges,
      },
    }}
    canvasProps={{
      panOnScroll: false,
      zoomOnScroll: false,
      preventScrolling: false,
      fitViewOptions: {
        minZoom: 0,
        padding: 0.2,
      },
    }}
  />
);
