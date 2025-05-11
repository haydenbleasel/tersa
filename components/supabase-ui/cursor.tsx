import { useReactFlow } from "@xyflow/react";
import { Cursor as CursorComponent, CursorBody, CursorName, CursorPointer } from "@/components/ui/kibo-ui/cursor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback, useLayoutEffect, useRef } from "react";
import { usePerfectCursor } from "@/hooks/use-perfect-cursor";
import { CursorEventPayload } from "@/hooks/use-realtime-cursors";

type CursorProps = {
  data: CursorEventPayload;
};

export const Cursor = ({ data }: CursorProps) => {
  const { flowToScreenPosition } = useReactFlow();
  const rCursor = useRef<HTMLDivElement>(null)

  const animateCursor = useCallback((point: number[]) => {
    if (rCursor.current) {
      rCursor.current.dataset.x = point[0].toString();
      rCursor.current.dataset.y = point[1].toString();
    }
  }, [])

  const onPointMove = usePerfectCursor(animateCursor)

  useLayoutEffect(() => {
    const { x, y } = flowToScreenPosition(data.position)
    
    onPointMove([x, y]);
  }, [onPointMove, data.position, flowToScreenPosition])

  return (
    <div 
      ref={rCursor} 
      className="fixed pointer-events-none select-none z-50 top-0 left-0" 
      style={{
        transform: `translate(${rCursor.current?.dataset.x || 0}px, ${rCursor.current?.dataset.y || 0}px)`,
        transition: 'transform 20ms ease-in-out'
      }}
    >
      <CursorComponent className="relative">
        <CursorPointer className="size-5" style={{ color: data.color }} />
        <CursorBody className="text-white py-1.5 text-sm font-semibold items-center flex-row gap-2" style={{ backgroundColor: data.color }}>
          <Avatar className="w-4 h-4 rounded-full">
            <AvatarImage src={data.user.avatar} />
            <AvatarFallback>{data.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CursorName>{data.user.name}</CursorName>
            {/* <CursorMessage>{cursors[id].message}</CursorMessage> */}
          </div>
        </CursorBody>
      </CursorComponent>
    </div>
  );
};
