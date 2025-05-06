import type { AudioNodeProps } from '@/components/nodes/audio';
import type { CodeNodeProps } from '@/components/nodes/code';
import type { FileNodeProps } from '@/components/nodes/file';
import type { ImageNodeProps } from '@/components/nodes/image';
import type { TextNodeProps } from '@/components/nodes/text';
import type { Node } from '@xyflow/react';

export const getTextFromTextNodes = (nodes: Node[]) => {
  return nodes
    .filter((node) => node.type === 'text')
    .map((node) => (node.data as TextNodeProps['data']).text)
    .filter(Boolean)
    .join('\n');
};

export const getTranscriptionFromAudioNodes = (nodes: Node[]) => {
  const transcripts = nodes
    .filter((node) => node.type === 'audio')
    .map((node) => (node.data as AudioNodeProps['data']).transcript)
    .filter(Boolean) as string[];

  return transcripts.join('\n');
};

export const getDescriptionsFromImageNodes = (nodes: Node[]) => {
  const descriptions = nodes
    .filter((node) => node.type === 'image')
    .map((node) => (node.data as ImageNodeProps['data']).description)
    .filter(Boolean) as string[];

  return descriptions.join('\n');
};

export const getImagesFromImageNodes = (nodes: Node[]) => {
  const sourceImages = nodes
    .filter((node) => node.type === 'image')
    .map((node) => (node.data as ImageNodeProps['data']).content)
    .filter(Boolean) as { url: string; type: string }[];

  const generatedImages = nodes
    .filter((node) => node.type === 'image')
    .map((node) => (node.data as ImageNodeProps['data']).generated)
    .filter(Boolean) as { url: string; type: string }[];

  return [...sourceImages, ...generatedImages];
};

export const isValidSourceTarget = (source: Node, target: Node) => {
  if (source.type === 'video' || source.type === 'drop') {
    return false;
  }

  if (target.type === 'audio' && source.type !== 'text') {
    return false;
  }

  if (target.type === 'file') {
    return false;
  }

  return true;
};

export const getCodeFromCodeNodes = (nodes: Node[]) => {
  const sourceCodes = nodes
    .filter((node) => node.type === 'code')
    .map((node) => (node.data as CodeNodeProps['data']).content)
    .filter(Boolean) as { text: string; language: string }[];

  const generatedCodes = nodes
    .filter((node) => node.type === 'code' && node.data.generated)
    .map((node) => (node.data as CodeNodeProps['data']).generated)
    .filter(Boolean) as { text: string; language: string }[];

  return [...sourceCodes, ...generatedCodes];
};

export const getFilesFromFileNodes = (nodes: Node[]) => {
  const files = nodes
    .filter((node) => node.type === 'file')
    .map((node) => (node.data as FileNodeProps['data']).content)
    .filter(Boolean) as { url: string; type: string; name: string }[];

  return files;
};
