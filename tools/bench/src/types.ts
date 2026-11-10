export type Api = 'node' | 'bun';

export interface BenchContext {
  dir: string;
  repoRoot: string;
  origin: string;
  wsUrl: string;
  uploadFile: string;
  url: (path: string) => string;
  stop: () => Promise<void>;
}

export interface BenchCase {
  id: string;
  group: string;
  label: string;
  bytes?: number;
  iterations: number;
  node: () => unknown;
  bun: () => unknown;
}

export interface Stats {
  medianMs: number;
  p95Ms: number;
  minMs: number;
  opsPerSecond: number;
  mibPerSecond: number | null;
}

export interface CaseResult {
  id: string;
  group: string;
  label: string;
  bytes: number | null;
  iterations: number;
  node: Stats;
  bun: Stats;
  ratio: number;
}

export interface RunMeta {
  date: string;
  bunVersion: string;
  bunRevision: string;
  nodeCompatVersion: string;
  platform: string;
  arch: string;
  rounds: number;
  filters: string[];
}

export interface RunResult {
  meta: RunMeta;
  results: CaseResult[];
}
