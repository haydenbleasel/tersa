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

export const CodeNode = (props: CodeNodeProps) => {
  const Component =
    props.data.source === 'primitive' ? CodePrimitive : CodeTransform;

  return <Component {...props} title="Code" />;
};
