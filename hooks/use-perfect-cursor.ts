import { PerfectCursor } from "perfect-cursors";
import { useCallback, useLayoutEffect, useState } from "react";

export const usePerfectCursor = (
  cb: (pt: number[]) => void,
  initialPoint?: number[]
) => {
  const [pc] = useState(() => new PerfectCursor(cb));

  useLayoutEffect(() => {
    if (initialPoint) {
      pc.addPoint(initialPoint);
    }

    return () => pc.dispose();
  }, [pc, initialPoint]);

  const onPointChange = useCallback(
    (newPoint: number[]) => pc.addPoint(newPoint),
    [pc]
  );

  return onPointChange;
};
