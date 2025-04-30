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
    generated?: {
      url: string;
      type: string;
    };
    updatedAt?: string;
    model?: string;
    instructions?: string;
    width?: number;
    height?: number;
  };
  id: string;
};

export const VideoNode = (props: VideoNodeProps) => {
  const Component =
    props.data.source === 'primitive' ? VideoPrimitive : VideoTransform;

  return <Component {...props} title="Video" />;
};
