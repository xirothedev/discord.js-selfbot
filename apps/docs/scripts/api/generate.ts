import { mkdtempSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { collectReflectionNames } from './collect-names';
import { frontmatterDescription } from './comment';
import { enrichClass, enrichType, loadApiStore } from './enrich';
import type { DocgenClass, DocgenType } from './enrich';
import { AREA_ORDER, areaFor, parseIndexExports, slugify } from './exports';
import { compareOutputs, meta, writeOutputs } from './output-files';
import type { GenerateResult } from './output-files';
import { renderApiIndex, renderAreaIndex } from './render-index';
import { renderPublicPage } from './render-public-page';
import { renderTypingsPage } from './render-typings';
import { reflectionsByName, runTypeDoc, sourceUrlFor } from './typedoc';
import { Kind } from './types';
import type { Reflection } from './types';
import { TYPINGS_GROUPS, typingsGroupFor } from './typings-groups';
import type { TypingsGroupId } from './typings-groups';

const docsDir = path.resolve(import.meta.dir, '../..');
const repoRoot = path.resolve(docsDir, '../..');
const packageDir = path.join(repoRoot, 'packages/discord-ts-selfbot');

interface PageItem {
  title: string;
  href: string;
  description?: string;
}

interface TypingsSection {
  items: PageItem[];
  count: number;
}

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
  const entryMeta = entry?.meta;
  if (!entryMeta?.file) {
    return sourceUrlForExport(exportedPath);
  }
  const full = [entryMeta.path, entryMeta.file]
    .filter(Boolean)
    .join('/')
    .replace(/\.js$/u, '.ts');
  return `https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/${full}#L${
    entryMeta.line ?? 1
  }`;
}

function isTypingsKind(kind: number): boolean {
  return (
    kind === Kind.Interface ||
    kind === Kind.TypeAlias ||
    kind === Kind.Variable ||
    kind === Kind.Function
  );
}

function addTypingsGroups(input: {
  typingsReflections: Map<string, Reflection>;
  publicNames: Set<string>;
  referencedNames: Set<string>;
  store: Map<string, DocgenClass | DocgenType>;
  outputs: Map<string, string>;
}): TypingsSection {
  const typingsOnly = [...input.typingsReflections.values()].filter(
    (reflection) =>
      !input.publicNames.has(reflection.name) &&
      input.referencedNames.has(reflection.name) &&
      isTypingsKind(reflection.kind)
  );
  for (const reflection of typingsOnly) {
    enrichType(reflection, input.store.get(reflection.name));
  }

  const typingsGroups = new Map<TypingsGroupId, Reflection[]>();
  for (const reflection of typingsOnly) {
    const group = typingsGroupFor(reflection.name);
    typingsGroups.set(group, [...(typingsGroups.get(group) ?? []), reflection]);
  }

  const items: PageItem[] = [];
  let count = 0;
  for (const group of TYPINGS_GROUPS) {
    const reflections = typingsGroups.get(group.id);
    if (!reflections?.length) {
      continue;
    }

    input.outputs.set(
      `api/typings/${group.id}.mdx`,
      renderTypingsPage({
        reflections,
        sourceUrl: sourceUrlFor(reflections[0]),
        title: group.title,
      })
    );
    items.push({
      description: `${reflections.length} public types.`,
      href: `/docs/api/typings/${group.id}`,
      title: group.title,
    });
    count += reflections.length;
  }

  return { count, items };
}

export function generateApi(options: { check?: boolean } = {}): GenerateResult {
  const tempDir = mkdtempSync(
    path.join(os.tmpdir(), 'discord-ts-selfbot-api-')
  );
  const typingsProject = runTypeDoc({
    entryPointStrategy: 'resolve',
    entryPoints: ['typings/index.d.ts'],
    outputJson: path.join(tempDir, 'typings.json'),
    packageDir,
  });

  const parsed = parseIndexExports(
    readFileSync(path.join(packageDir, 'src/index.ts'), 'utf-8')
  );
  const { version } = JSON.parse(
    readFileSync(path.join(packageDir, 'package.json'), 'utf-8')
  ) as {
    version: string;
  };
  const typingsReflections = reflectionsByName(typingsProject);
  const store = loadApiStore(path.join(docsDir, 'scripts/agent/api.json'));
  const outputs = new Map<string, string>();
  const areaItems = new Map<string, PageItem[]>();
  const areaCounts = new Map<string, number>();
  const publicNames = new Set(parsed.public.map((item) => item.name));
  const publicReflections: Reflection[] = [];
  const skipped: string[] = [];

  for (const exported of parsed.public) {
    const typings = typingsReflections.get(exported.name);
    if (!typings) {
      skipped.push(exported.name);
      continue;
    }

    const storeEntry = store.get(exported.name);
    enrichClass(undefined, typings, storeEntry);
    enrichType(typings, storeEntry);
    const privateMembers =
      typings.children
        ?.filter((child) => child.flags?.isPrivate || child.flags?.isProtected)
        .map((child) => child.name) ?? [];
    const sourceUrl = sourceUrlForEntry(storeEntry, exported.path);
    const area = areaFor(exported.path);
    const slug = slugify(exported.name);
    const page = renderPublicPage({
      docgen: storeEntry,
      exported,
      privateMembers,
      sourceUrl,
      typings,
    });
    if (!page) {
      skipped.push(exported.name);
      continue;
    }

    publicReflections.push(typings);
    outputs.set(`api/${area}/${slug}.mdx`, page);
    areaItems.set(area, [
      ...(areaItems.get(area) ?? []),
      {
        description: frontmatterDescription(
          typings.comment,
          `${exported.name} API reference.`
        ),
        href: `/docs/api/${area}/${slug}`,
        title: exported.name,
      },
    ]);
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }

  const referencedNames = new Set<string>();
  for (const reflection of publicReflections) {
    collectReflectionNames(reflection, referencedNames);
  }

  const typingsSection = addTypingsGroups({
    outputs,
    publicNames,
    referencedNames,
    store,
    typingsReflections,
  });

  if (typingsSection.items.length) {
    areaItems.set('typings', typingsSection.items);
    areaCounts.set('typings', typingsSection.count);
    outputs.set(
      'api/typings/index.mdx',
      renderAreaIndex({
        description:
          'Public interfaces, type aliases, variables, and functions from typings/index.d.ts.',
        items: typingsSection.items,
        title: 'Typings',
      })
    );
    outputs.set(
      'api/typings/meta.json',
      meta('Typings', [
        'index',
        ...typingsSection.items.map((item) => path.basename(item.href)),
      ])
    );
  }

  for (const [area, items] of areaItems) {
    const sorted = [...items].toSorted((left, right) =>
      left.title.localeCompare(right.title)
    );
    const areaMeta = AREA_ORDER.find((entry) => entry.id === area);
    outputs.set(
      `api/${area}/index.mdx`,
      renderAreaIndex({
        description: `Public ${areaMeta?.title.toLowerCase() ?? area} API.`,
        items: sorted,
        title: areaMeta?.title ?? area,
      })
    );
    outputs.set(
      `api/${area}/meta.json`,
      meta(areaMeta?.title ?? area, [
        'index',
        ...sorted.map((item) => path.basename(item.href)),
      ])
    );
  }

  const indexAreas = AREA_ORDER.map((area) => ({
    ...area,
    count: areaCounts.get(area.id) ?? 0,
  }));
  outputs.set(
    'api/index.mdx',
    renderApiIndex({
      aliases: parsed.aliases.map((item) => item.name),
      areas: indexAreas,
      external: parsed.external,
      skipped,
      version,
    })
  );
  outputs.set(
    'api/meta.json',
    meta('API Reference', [
      'index',
      ...indexAreas.filter((area) => area.count > 0).map((area) => area.id),
    ])
  );

  return options.check ? compareOutputs(outputs) : writeOutputs(outputs);
}
