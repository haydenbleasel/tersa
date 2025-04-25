import { ImagePrimitive } from './primitive';
import { ImageTransform } from './transform';

export type ImageNodeProps = {
  type: string;
  data: {
    source: 'primitive' | 'transform';
    content?: {
      url: string;
      type: string;
    };
    width?: number;
    height?: number;
    updatedAt?: string;
    model?: string;
    description?: string;
    instructions?: string;
  };
  id: string;
};

export const ImageNode = ({ data, id, type }: ImageNodeProps) => {
  const Component =
    data.source === 'primitive' ? ImagePrimitive : ImageTransform;

  return <Component data={data} id={id} type={type} title="Image" />;
};
