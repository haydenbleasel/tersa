import { AudioPrimitive } from './primitive';
import { AudioTransform } from './transform';

export type AudioNodeProps = {
  type: string;
  data: {
    source: 'primitive' | 'transform';
    audio?: {
      url: string;
      type: string;
    };
    updatedAt?: string;
    model?: string;
    transcript?: string;
  };
  id: string;
};

export const AudioNode = ({ data, id, type }: AudioNodeProps) => {
  const Component =
    data.source === 'primitive' ? AudioPrimitive : AudioTransform;

  return <Component data={data} id={id} type={type} title="Audio" />;
};
