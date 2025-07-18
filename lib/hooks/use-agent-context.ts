import { useState, useCallback, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { atom, useAtom } from 'jotai';

// Atoms for persisting agent context
const agentSessionAtom = atom({
  currentGoal: '',
  recentActions: [] as string[],
  taggedNodes: [] as string[],
  workflowStyle: 'efficient' as 'efficient' | 'detailed' | 'creative',
});

const agentPreferencesAtom = atom({
  showReasoning: false,
  autoSuggest: true,
  modelPreference: 'balanced' as 'fast' | 'balanced' | 'quality',
});

export function useAgentContext() {
  const [session, setSession] = useAtom(agentSessionAtom);
  const [preferences, setPreferences] = useAtom(agentPreferencesAtom);
  const reactFlowInstance = useReactFlow();
  
  // Track recent actions
  const addRecentAction = useCallback((action: string) => {
    setSession(prev => ({
      ...prev,
      recentActions: [action, ...prev.recentActions.slice(0, 9)], // Keep last 10
    }));
  }, [setSession]);
  
  // Update current goal
  const setCurrentGoal = useCallback((goal: string) => {
    setSession(prev => ({
      ...prev,
      currentGoal: goal,
    }));
  }, [setSession]);
  
  // Tag nodes for context
  const tagNodes = useCallback((nodeIds: string[]) => {
    setSession(prev => ({
      ...prev,
      taggedNodes: [...new Set([...prev.taggedNodes, ...nodeIds])],
    }));
  }, [setSession]);
  
  const untagNode = useCallback((nodeId: string) => {
    setSession(prev => ({
      ...prev,
      taggedNodes: prev.taggedNodes.filter(id => id !== nodeId),
    }));
  }, [setSession]);
  
  // Get canvas summary
  const getCanvasSummary = useCallback(() => {
    if (!reactFlowInstance) return null;
    
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypes: [...new Set(nodes.map(n => n.type))],
      selectedNodes: nodes.filter(n => n.selected).map(n => n.id),
      taggedNodes: session.taggedNodes,
    };
  }, [reactFlowInstance, session.taggedNodes]);
  
  // Build runtime context for agent
  const buildRuntimeContext = useCallback((additionalContext?: Record<string, any>) => {
    const canvasSummary = getCanvasSummary();
    
    return new Map([
      ['current-goal', session.currentGoal],
      ['recent-actions', session.recentActions],
      ['workflow-style', session.workflowStyle],
      ['canvas-summary', canvasSummary],
      ['show-reasoning', preferences.showReasoning],
      ['model-preference', preferences.modelPreference],
      ...Object.entries(additionalContext || {}),
    ]);
  }, [session, preferences, getCanvasSummary]);
  
  // Clear session
  const clearSession = useCallback(() => {
    setSession({
      currentGoal: '',
      recentActions: [],
      taggedNodes: [],
      workflowStyle: 'efficient',
    });
  }, [setSession]);
  
  return {
    // Session state
    session,
    preferences,
    
    // Session actions
    addRecentAction,
    setCurrentGoal,
    tagNodes,
    untagNode,
    clearSession,
    
    // Preferences actions
    setPreferences,
    
    // Context builders
    getCanvasSummary,
    buildRuntimeContext,
  };
}