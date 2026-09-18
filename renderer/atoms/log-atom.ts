import { atom } from "jotai";

export const logAtom = atom<string[]>([]);
/** Receipt times kept separate so raw diagnostic text remains unchanged. */
export const logTimesAtom = atom<number[]>([]);
