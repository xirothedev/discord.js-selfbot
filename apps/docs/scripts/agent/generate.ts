import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { summaryText } from '../api/comment';
import { enrichClass, enrichType, loadApiStore } from '../api/enrich';
import type { DocgenClass, DocgenType } from '../api/enrich';
import { areaFor, parseIndexExports, slugify } from '../api/exports';
import { reflectionsByName, runTypeDoc } from '../api/typedoc';
import { Kind } from '../api/types';
import type { GeneratedPage } from './guides';
import { buildLinkMap, collectGuides, oneLine, rewriteLinks } from './guides';
import {
  KNOWN_UNTYPED_EXPORTS,
  renderAgentsMd,
  renderEventsIndex,
  renderIndex,
  renderReadme,
  renderReferenceIndex,
} from './render-indexes';
import {
  isRuntimeKind,
  renderClassPage,
  renderFunctionPage,
  renderVariablePage,
} from './render';
import { compareTrees, writeTree } from './tree';

const docsDir = path.resolve(import.meta.dir, '../..');
const repoRoot = path.resolve(docsDir, '../..');
const packageDir = path.join(repoRoot, 'packages/discord-ts-selfbot');

// The runtime export names differ from the class names in the public typings.
const TYPINGS_ALIASES: Record<string, string> = {
  ActivityFlagsBitField: 'ActivityFlags',
  ApplicationFlagsBitField: 'ApplicationFlags',
  AttachmentFlagsBitField: 'AttachmentFlags',
  GuildMemberFlagsBitField: 'GuildMemberFlags',
  IntentsBitField: 'Intents',
  MessageFlagsBitField: 'MessageFlags',
  PermissionsBitField: 'Permissions',
  RoleFlagsBitField: 'RoleFlags',
  SystemChannelFlagsBitField: 'SystemChannelFlags',
  ThreadMemberFlagsBitField: 'ThreadMemberFlags',
  UserFlagsBitField: 'UserFlags',
};

function sourceUrlForExport(exportedPath: string): string {
  const relative =
    exportedPath === './index'
      ? 'src/index.ts'
      : `src/${exportedPath.slice(2)}.ts`;
  return `https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/${relative}#L1`;
}

function sourceUrlForEntry(
  entry: DocgenClass | DocgenType | undefined,
  exportedPath: string
): string {
  const meta = entry?.meta;
  if (!meta?.file) {
    return sourceUrlForExport(exportedPath);
  }
  const full = [meta.path, meta.file]
    .filter(Boolean)
    .join('/')
    .replace(/\.js$/u, '.ts');
  return `https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/${full}#L${
    meta.line ?? 1
  }`;
}

export function generateAgentDocs(options: { outputDir: string }): {
  files: string[];
  missing: string[];
  pages: GeneratedPage[];
} {
  const { version } = JSON.parse(
    readFileSync(path.join(packageDir, 'package.json'), 'utf-8')
  ) as {
    version: string;
  };
  const tempDir = mkdtempSync(
    path.join(os.tmpdir(), 'discord-selfbot-core-agent-')
  );
  const project = runTypeDoc({
    entryPointStrategy: 'resolve',
    entryPoints: ['typings/index.d.ts'],
    outputJson: path.join(tempDir, 'typings.json'),
    packageDir,
  });
  const typingsByName = reflectionsByName(project);
  const parsed = parseIndexExports(
    readFileSync(path.join(packageDir, 'src/index.ts'), 'utf-8')
  );
  const store = loadApiStore(path.join(import.meta.dir, 'api.json'));

  const pages: GeneratedPage[] = [];
  const missing: string[] = [];
  const seen = new Set<string>();

  for (const exported of parsed.public) {
    if (seen.has(exported.name)) {
      continue;
    }
    seen.add(exported.name);
    if (exported.typeOnly) {
      continue;
    }

    const reflectionName = TYPINGS_ALIASES[exported.name] ?? exported.name;
    const typings = typingsByName.get(reflectionName);
    if (!typings) {
      if (!KNOWN_UNTYPED_EXPORTS.has(exported.name)) {
        missing.push(exported.name);
      }
      continue;
    }

    if (!isRuntimeKind(typings.kind)) {
      continue;
    }

    const storeEntry = store.get(reflectionName);
    if (typings.kind === Kind.Class) {
      enrichClass(undefined, typings, storeEntry as DocgenClass | undefined);
    } else {
      enrichType(typings, storeEntry as DocgenType | undefined);
    }

    const area = areaFor(exported.path);
    const slug = slugify(exported.name);
    const sourceUrl = sourceUrlForEntry(storeEntry, exported.path);
    let markdown: string;
    if (typings.kind === Kind.Class) {
      markdown = renderClassPage({
        events: (storeEntry as DocgenClass | undefined)?.events,
        name: exported.name,
        sourceUrl,
        typings,
      });
    } else if (typings.kind === Kind.Function) {
      markdown = renderFunctionPage({
        name: exported.name,
        sourceUrl,
        typings,
      });
    } else {
      markdown = renderVariablePage({
        name: exported.name,
        sourceUrl,
        typings,
      });
    }

    pages.push({
      area,
      description:
        oneLine(summaryText(typings.comment)) || `${exported.name} reference.`,
      markdown,
      name: exported.name,
      reflectionName,
      slug,
    });
  }

  const duplicateSlugs = pages
    .map((page) => `${page.area}/${page.slug}`)
    .filter((value, index, all) => all.indexOf(value) !== index);
  if (duplicateSlugs.length) {
    throw new Error(
      `Duplicate reference slugs: ${[...new Set(duplicateSlugs)].join(', ')}`
    );
  }

  const guides = collectGuides();
  const links = buildLinkMap(pages, guides);
  const files = new Map<string, string>();

  for (const page of pages) {
    const relative = `reference/${page.area}/${page.slug}.md`;
    files.set(relative, page.markdown);
  }

  const referenceIndex = renderReferenceIndex(pages, version);
  files.set('reference/index.md', referenceIndex);

  const eventsIndex = renderEventsIndex(pages, store);
  const hasEvents = eventsIndex.includes('\n## ');
  if (hasEvents) {
    files.set('events/index.md', eventsIndex);
  }

  for (const guide of guides) {
    const body = rewriteLinks(guide.body, guide.target, links);
    files.set(guide.target, `# ${guide.title}\n\n${body}\n`);
  }

  files.set(
    'llms.txt',
    renderIndex({
      guides,
      hasEvents,
      pages,
      version,
    })
  );
  files.set('README.md', renderReadme(version));
  files.set('AGENTS.md', renderAgentsMd());

  writeTree(options.outputDir, files);
  rmSync(tempDir, { force: true, recursive: true });

  return { files: [...files.keys()].toSorted(), missing, pages };
}

function main(): void {
  const check = process.argv.includes('--check');
  const outIndex = process.argv.indexOf('--out');
  const outputDir =
    outIndex === -1
      ? path.join(packageDir, 'docs')
      : path.resolve(process.argv[outIndex + 1]);

  if (check) {
    const temp = mkdtempSync(
      path.join(os.tmpdir(), 'discord-selfbot-core-agent-check-')
    );
    try {
      const result = generateAgentDocs({ outputDir: temp });
      const diffs = compareTrees(outputDir, temp);
      if (result.missing.length) {
        console.error(
          `Missing typings reflections: ${result.missing.join(', ')}`
        );
        process.exitCode = 1;
      }
      if (diffs.length) {
        console.error(`Agent docs are out of date (${diffs.length} files):`);
        for (const diff of diffs.slice(0, 20)) {
          console.error(`  ${diff}`);
        }
        process.exitCode = 1;
      }
      if (!result.missing.length && !diffs.length) {
        console.log('Agent docs are up to date.');
      }
    } finally {
      rmSync(temp, { force: true, recursive: true });
    }
    return;
  }

  const result = generateAgentDocs({ outputDir });
  console.log(`Generated ${result.files.length} agent docs files.`);
  if (result.missing.length) {
    console.warn(`Missing typings reflections: ${result.missing.join(', ')}`);
  }
}

if (import.meta.main) {
  main();
}
