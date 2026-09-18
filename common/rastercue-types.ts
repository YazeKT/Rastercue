export type JobStatus = "running" | "completed" | "failed" | "cancelled" | "interrupted";
export type JobSettings = Record<string, string | number | boolean | null>;
export type HistoryFileInfo = { path: string; bytes: number | null; width: number | null; height: number | null; missing: boolean };
export type HistoryFile = { id: string; source: HistoryFileInfo; output?: HistoryFileInfo; thumbnail?: string };
export type RastercueJob = {
  id: string; kind: "single" | "double" | "batch"; status: JobStatus;
  startedAt: string; endedAt?: string; durationMs?: number; model: string; scale: string;
  destination: string; settings: JobSettings; files: HistoryFile[]; warnings: string[];
  progress: string; desiredName?: string;
};
export type HistorySnapshot = { version: 1; folder: string; records: RastercueJob[]; current: RastercueJob | null; persistenceError?: string };
export interface RastercueAPI {
  list(): Promise<HistorySnapshot>;
  current(): Promise<RastercueJob | null>;
  setDesiredName(name: string): Promise<void>;
  rename(jobId: string, fileId: string, name: string): Promise<HistorySnapshot>;
  open(jobId: string, fileId: string): Promise<void>;
  openFolder(jobId?: string): Promise<void>;
  relocate(): Promise<HistorySnapshot>;
  clear(confirmed: boolean): Promise<HistorySnapshot>;
  onChanged(callback: (snapshot: HistorySnapshot) => void): () => void;
}
declare global { interface Window { rastercue: RastercueAPI } }
