import { atom, useAtom } from 'jotai';
import tunnel from 'tunnel-rat';

export const ReasoningTunnel = tunnel();
export const reasoningAtom = atom({
  isReasoning: false,
  isGenerating: false,
});
export const useReasoning = () => useAtom(reasoningAtom);
