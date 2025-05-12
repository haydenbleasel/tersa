'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

type NodeOperationsContextType = {
  addNode: (type: string, options?: Record<string, unknown>) => string;
};

const NodeOperationsContext = createContext<NodeOperationsContextType | null>(
  null
);

export const useNodeOperations = () => {
  const context = useContext(NodeOperationsContext);
  if (!context) {
    throw new Error(
      'useNodeOperations must be used within a NodeOperationsProvider'
    );
  }
  return context;
};

type NodeOperationsProviderProps = {
  addNode: (type: string, options?: Record<string, unknown>) => string;
  children: ReactNode;
};

export const NodeOperationsProvider = ({
  addNode,
  children,
}: NodeOperationsProviderProps) => {
  return (
    <NodeOperationsContext.Provider value={{ addNode }}>
      {children}
    </NodeOperationsContext.Provider>
  );
};
