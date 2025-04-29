import { NodeResizeControl } from '@xyflow/react';
import { Logo } from '../logo';

export const LogoNode = () => (
  <>
    <Logo />
    <NodeResizeControl keepAspectRatio />
  </>
);
