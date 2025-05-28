import { type Node, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { domToJpeg } from 'modern-screenshot';

export const getScreenshot = async (nodes: Node[]) => {
  const nodesBounds = getNodesBounds(nodes);
  const viewport = getViewportForBounds(nodesBounds, 1200, 630, 0.5, 2, 16);

  const image = await domToJpeg(
    document.querySelector('.react-flow__viewport') as HTMLElement,
    {
      width: 1200,
      height: 630,
      style: {
        width: '1200px',
        height: '630px',
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }
  );

  return image;
};

// const image = await getScreenshot(rfInstance.getNodes());
// const screenshot = await uploadFile(
//   new File([image], 'screenshot.jpg', { type: 'image/jpeg' }),
//   'screenshots',
//   `${projectId}.jpg`
// );
