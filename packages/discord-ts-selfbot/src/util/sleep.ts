import { setTimeout } from 'node:timers/promises';

// The one sleep seam for shared runtime code (ADR 0013): the `node:timers/promises`
// equivalent of `Bun.sleep(ms)` with the same ref semantics, correct on both
// supported runtimes. Do not call `Bun.sleep` in `src/**`; the dual-runtime
// guard test fails the build.
export function sleep(ms: number): Promise<void> {
  return setTimeout(ms);
}
