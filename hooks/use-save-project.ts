'use client';

import { atom, useAtom } from 'jotai';

export const saveProjectAtom = atom({
  isSaving: false,
  lastSaved: null as Date | null,
});

export const useSaveProject = () => useAtom(saveProjectAtom);
