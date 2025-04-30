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
    generated?: {
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

export const ImageNode = (props: ImageNodeProps) => {
  const Component =
    props.data.source === 'primitive' ? ImagePrimitive : ImageTransform;

  return <Component {...props} title="Image" />;
};
