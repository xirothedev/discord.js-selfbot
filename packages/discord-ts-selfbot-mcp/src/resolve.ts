import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

export type DocsStatus = 'use_bundled_docs' | 'install_required' | 'missing_docs';
export type VersionSource = 'installed' | 'declared' | null;

export interface DocsResolution {
  status: DocsStatus;
  version: string | null;
  versionSource: VersionSource;
  docsPath: string | null;
  indexPath: string | null;
  docsAvailable: boolean;
  instructions: string[];
}

function readVersion(packagePath: string): string | undefined {
  try {
    const data = JSON.parse(readFileSync(packagePath, 'utf8')) as { version?: string };
    return typeof data.version === 'string' ? data.version : undefined;
  } catch {
    return undefined;
  }
}

function declaredVersion(projectPath: string): string | undefined {
  try {
    const data = JSON.parse(readFileSync(path.join(projectPath, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return data.dependencies?.['discord-ts-selfbot'] ?? data.devDependencies?.['discord-ts-selfbot'];
  } catch {
    return undefined;
  }
}

function installedPackage(projectPath: string): { packagePath: string; version: string } | undefined {
  try {
    const require = createRequire(path.join(projectPath, 'package.json'));
    const packagePath = require.resolve('discord-ts-selfbot/package.json');
    const version = readVersion(packagePath);
    if (version) return { packagePath, version };
  } catch {
    // Fall through to the direct node_modules path.
  }

  const fallback = path.join(projectPath, 'node_modules/discord-ts-selfbot/package.json');
  const version = readVersion(fallback);
  return version ? { packagePath: fallback, version } : undefined;
}

function topicInstruction(topic: string | undefined): string[] {
  if (!topic?.trim()) return [];
  return [`Start with the pages that mention "${topic.trim()}".`];
}

export function resolveDocs(projectPath: string = process.cwd(), topic?: string): DocsResolution {
  const declared = declaredVersion(projectPath);
  const installed = installedPackage(projectPath);

  if (!installed) {
    return {
      status: 'install_required',
      version: declared ?? null,
      versionSource: declared ? 'declared' : null,
      docsPath: null,
      indexPath: null,
      docsAvailable: false,
      instructions: [
        'Install this project dependencies, then call selfbot_docs again to locate the installed docs.',
        'Until then, use https://xirothedev.github.io/discord.js-selfbot/ and verify APIs against the installed version.',
      ],
    };
  }

  const docsPath = path.join(path.dirname(installed.packagePath), 'docs');
  const indexPath = path.join(docsPath, 'llms.txt');

  if (!existsSync(indexPath)) {
    return {
      status: 'missing_docs',
      version: installed.version,
      versionSource: 'installed',
      docsPath,
      indexPath: null,
      docsAvailable: false,
      instructions: [
        `The installed discord-ts-selfbot@${installed.version} has no docs/llms.txt.`,
        'Reinstall or upgrade the package, then call selfbot_docs again.',
        'Until then, use https://xirothedev.github.io/discord.js-selfbot/ and verify APIs against the installed version.',
      ],
    };
  }

  return {
    status: 'use_bundled_docs',
    version: installed.version,
    versionSource: 'installed',
    docsPath,
    indexPath,
    docsAvailable: true,
    instructions: [
      `Read ${indexPath} first. It lists the getting-started pages, guides, examples, reference, and event catalog.`,
      'Then open only the page for the task. The reference is generated from the public typings; exact types are in typings/index.d.ts.',
      ...topicInstruction(topic),
    ],
  };
}
