import { VideoPrimitive } from './primitive';
import { VideoTransform } from './transform';

export type VideoNodeProps = {
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
    instructions?: string;
  };
  id: string;
};

export const VideoNode = ({ data, id, type }: VideoNodeProps) => {
  const Component =
    data.source === 'primitive' ? VideoPrimitive : VideoTransform;

  return <Component data={data} id={id} type={type} title="Video" />;
};
