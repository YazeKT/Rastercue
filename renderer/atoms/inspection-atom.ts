import { atom } from "jotai";
export type InspectionView = { zoom: number; x: number; y: number; fit: boolean; fitZoom: number };
export const inspectionAtom = atom<InspectionView>({ zoom: 100, x: 0, y: 0, fit: true, fitZoom: 100 });
export const inspectionBookmarksAtom = atom<Array<{ name: string; view: InspectionView }>>([]);

