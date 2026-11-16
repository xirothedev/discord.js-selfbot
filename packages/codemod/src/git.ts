import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

export interface GitState {
  readonly isRepo: boolean;
  readonly dirty: boolean;
}

export function inspectGit(cwd: string): GitState {
  if (!existsSync(path.join(cwd, '.git'))) {
    const toplevel = spawnSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf-8',
    });
    if (toplevel.status !== 0) {
      return { dirty: false, isRepo: false };
    }
  }
  const status = spawnSync('git', ['status', '--porcelain'], {
    cwd,
    encoding: 'utf-8',
  });
  if (status.status !== 0) {
    return { dirty: false, isRepo: false };
  }
  return { dirty: status.stdout.trim().length > 0, isRepo: true };
}
