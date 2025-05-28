import { atom, useAtom } from 'jotai';

export const reasoningAtom = atom({
  isReasoning: false,
  isGenerating: false,
});

export const useReasoning = () => useAtom(reasoningAtom);
