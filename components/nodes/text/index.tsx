import type { JSONContent } from '@tiptap/core';
import { TextPrimitive } from './primitive';
import { TextTransform } from './transform';

export type TextNodeProps = {
  type: string;
  data: {
    source: 'primitive' | 'transform';
    generated?: {
      text: string;
    };
    model?: string;
    updatedAt?: string;
    instructions?: string;

    // Tiptap generated JSON content
    content?: JSONContent;

    // Tiptap text content
    text?: string;
  };
  id: string;
};

export const TextNode = (props: TextNodeProps) => {
  const Component =
    props.data.source === 'primitive' ? TextPrimitive : TextTransform;

  return <Component {...props} title="Text" />;
};
