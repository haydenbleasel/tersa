import { FilePrimitive } from './primitive';

export type FileNodeProps = {
  type: string;
  data: {
    source: 'primitive';
    content?: {
      url: string;
      type: string;
      name: string;
    };
    updatedAt?: string;
  };
  id: string;
};

export const FileNode = (props: FileNodeProps) => (
  <FilePrimitive {...props} title="File" />
);
