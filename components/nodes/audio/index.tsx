import { AudioPrimitive } from './primitive';
import { AudioTransform } from './transform';

export type AudioNodeProps = {
  type: string;
  data: {
    source: 'primitive' | 'transform';
    content?: {
      url: string;
      type: string;
    };
    generated?: {
      url: string;
      type: string;
    };
    updatedAt?: string;
    model?: string;
    transcript?: string;
    instructions?: string;
  };
  id: string;
};

export const AudioNode = (props: AudioNodeProps) => {
  const Component =
    props.data.source === 'primitive' ? AudioPrimitive : AudioTransform;

  return <Component {...props} title="Audio" />;
};
