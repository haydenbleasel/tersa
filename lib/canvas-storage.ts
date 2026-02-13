import type { Edge, Node } from "@xyflow/react";

const STORAGE_KEY = "tersa-canvas";

type CanvasData = {
  nodes: Node[];
  edges: Edge[];
};

export const saveCanvas = (data: CanvasData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
};

export const loadCanvas = (): CanvasData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as CanvasData;
  } catch {
    return null;
  }
};
