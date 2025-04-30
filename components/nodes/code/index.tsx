import { CodePrimitive } from './primitive';
import { CodeTransform } from './transform';

export type CodeNodeProps = {
  type: string;
  data: {
    source: 'primitive' | 'transform';
    generated?: {
      text?: string;
      language?: string;
    };
    model?: string;
    updatedAt?: string;
    instructions?: string;
    content?: {
      text?: string;
      language?: string;
    };
  };
  id: string;
};

export const CodeNode = ({ data, id, type }: CodeNodeProps) => {
  const Component = data.source === 'primitive' ? CodePrimitive : CodeTransform;

  return <Component data={data} id={id} type={type} title="Code" />;
};
