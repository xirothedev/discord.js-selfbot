import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { stripJsdocSyntax, summaryText } from '../api/comment';
import { enrichClass, enrichType, loadApiStore } from '../api/enrich';
import type { DocgenClass, DocgenType } from '../api/enrich';
import { areaFor, AREA_ORDER, parseIndexExports, slugify } from '../api/exports';
import { reflectionsByName, runTypeDoc } from '../api/typedoc';
import { Kind } from '../api/types';
import { convertMdx } from './mdx';
import { isRuntimeKind, renderClassPage, renderFunctionPage, renderVariablePage } from './render';

const docsDir = path.resolve(import.meta.dir, '../..');
const repoRoot = path.resolve(docsDir, '../..');
const packageDir = path.join(repoRoot, 'packages/discord-ts-selfbot');
const contentDir = path.join(docsDir, 'content/docs');
const siteBase = 'https://xirothedev.github.io/discord.js-selfbot';

interface GeneratedPage {
  area: string;
  slug: string;
  name: string;
  reflectionName: string;
  description: string;
  markdown: string;
}

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

// `src/WebSocket.ts` is a runtime shim over `ws` that the public typings do not
// describe. Keep it out of the coverage gate until the typings gain a value export.
const KNOWN_UNTYPED_EXPORTS = new Set(['WebSocket']);

interface GeneratedGuide {
  source: string;
  target: string;
  title: string;
  description: string;
  body: string;
}

function sourceUrlForExport(exportedPath: string): string {
  const relative = exportedPath === './index' ? 'src/index.ts' : `src/${exportedPath.slice(2)}.ts`;
  return `https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/${relative}#L1`;
}

function sourceUrlForEntry(entry: DocgenClass | DocgenType | undefined, exportedPath: string): string {
  const meta = entry?.meta;
  if (!meta?.file) return sourceUrlForExport(exportedPath);
  const full = [meta.path, meta.file].filter(Boolean).join('/').replace(/\.js$/, '.ts');
  return `https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/${full}#L${
    meta.line ?? 1
  }`;
}

function readIfExists(file: string): string | undefined {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
}

function walk(root: string): string[] {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function collectGuides(): GeneratedGuide[] {
  const guides: GeneratedGuide[] = [];
  const add = (source: string, target: string) => {
    const text = readIfExists(source);
    if (!text) return;
    const converted = convertMdx(text, {
      include: file => readIfExists(path.resolve(docsDir, file)),
    });
    guides.push({
      source,
      target,
      title: converted.title,
      description: converted.description ?? '',
      body: converted.body,
    });
  };

  add(path.join(contentDir, 'index.mdx'), 'index.md');
  for (const group of ['getting-started', 'guides', 'examples']) {
    const root = path.join(contentDir, group);
    for (const file of walk(root).filter(candidate => candidate.endsWith('.mdx'))) {
      const name = path.basename(file, '.mdx');
      add(file, `${group}/${name}.md`);
    }
  }

  return guides.sort((a, b) => a.target.localeCompare(b.target));
}

function buildLinkMap(reference: GeneratedPage[], guides: GeneratedGuide[]): Map<string, string> {
  const links = new Map<string, string>();
  links.set('/docs', 'index.md');
  links.set('/docs/api', 'reference/index.md');

  for (const guide of guides) {
    const target = guide.target;
    if (target === 'index.md') continue;
    const [group, name] = target.split('/');
    if (group === 'getting-started') links.set(`/docs/getting-started/${name.replace(/\.md$/, '')}`, target);
    if (group === 'guides') links.set(`/docs/guides/${name.replace(/\.md$/, '')}`, target);
    if (group === 'examples') links.set(`/docs/examples/${name.replace(/\.md$/, '')}`, target);
  }

  for (const page of reference) {
    links.set(`/docs/api/${page.area}/${page.slug}`, `reference/${page.area}/${page.slug}.md`);
  }

  return links;
}

function rewriteLinks(body: string, current: string, links: Map<string, string>): string {
  return body.replace(
    /\[([^\]]+)\]\((\/docs[^)\s#]*)(#[^)]*)?\)/g,
    (match, label: string, target: string, hash: string | undefined) => {
      const mapped = links.get(target);
      if (mapped) {
        const relative = path.posix.relative(path.posix.dirname(current), mapped);
        return `[${label}](${relative}${hash ?? ''})`;
      }

      const fallback =
        target === '/docs/examples'
          ? 'examples/index.md'
          : target === '/docs/getting-started'
            ? 'getting-started/installation.md'
            : target.startsWith('/docs/api/')
              ? 'reference/index.md'
              : undefined;

      if (fallback) {
        const relative = path.posix.relative(path.posix.dirname(current), fallback);
        return `[${label}](${relative}${hash ?? ''})`;
      }

      if (target.startsWith('/docs/project/')) {
        return `[${label}](${siteBase}${target}${hash ?? ''})`;
      }

      return match;
    },
  );
}

function oneLine(text: string | undefined, limit = 140): string {
  const value = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}

function renderReferenceIndex(pages: GeneratedPage[], version: string): string {
  const sections = AREA_ORDER.map(area => {
    const items = pages.filter(page => page.area === area.id).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) return '';
    const lines = items.map(page => `- [${page.name}](./${area.id}/${page.slug}.md): ${page.description}`);
    return `### ${area.title}\n\n${lines.join('\n')}`;
  });

  const gaps = [...KNOWN_UNTYPED_EXPORTS]
    .sort()
    .map(name => `- \`${name}\`: runtime shim, not described by the public typings.`)
    .join('\n');

  return `# API reference\n\nPublic runtime surface of \`discord-ts-selfbot@${version}\`. Every page is generated from \`typings/index.d.ts\`.\n\nType-only exports stay in \`typings/index.d.ts\`; this reference does not repeat them.\n\n${sections.filter(Boolean).join('\n\n')}${gaps ? `\n\n## Known gaps\n\n${gaps}` : ''}\n`;
}

function renderEventsIndex(pages: GeneratedPage[], store: Map<string, DocgenClass | DocgenType>): string {
  const publicNames = new Set(pages.map(page => page.name));
  const sections: string[] = [];

  for (const page of pages.sort((a, b) => a.name.localeCompare(b.name))) {
    const classEvents = (store.get(page.reflectionName) as DocgenClass | undefined)?.events;
    if (!classEvents?.length || !publicNames.has(page.name)) continue;

    const lines = classEvents.map(event => {
      const description = oneLine(stripJsdocSyntax(event.description ?? ''));
      return `- [\`${event.name}\`](../reference/${page.area}/${page.slug}.md#events): ${description || 'No description.'}`;
    });

    sections.push(`## ${page.name}\n\n${lines.join('\n')}`);
  }

  return `# Event catalog\n\nEvents emitted by public classes. Each entry links to the class reference.\n\n${sections.join('\n\n')}\n`;
}

function renderIndex(input: {
  version: string;
  guides: GeneratedGuide[];
  pages: GeneratedPage[];
  hasEvents: boolean;
}): string {
  const { version, guides, pages, hasEvents } = input;
  const section = (title: string, entries: string[]) => (entries.length ? `## ${title}\n\n${entries.join('\n')}` : '');

  const startOrder = new Map(
    [
      'index.md',
      'getting-started/installation.md',
      'getting-started/token-safety.md',
      'getting-started/first-client.md',
      'getting-started/agents.md',
      'getting-started/migration-v13.md',
    ].map((target, index) => [target, index]),
  );
  const start = guides
    .filter(guide => guide.target === 'index.md' || guide.target.startsWith('getting-started/'))
    .sort((a, b) => (startOrder.get(a.target) ?? 99) - (startOrder.get(b.target) ?? 99));
  const usage = guides.filter(guide => guide.target.startsWith('guides/'));
  const examples = guides.filter(guide => guide.target.startsWith('examples/'));

  const startLines = [
    '- [AGENTS.md block](./AGENTS.md): Copy this block into the project AGENTS.md before coding.',
    ...start.map(guide => `- [${guide.title}](./${guide.target}): ${oneLine(guide.description) || 'Start here.'}`),
  ];
  const usageLines = usage.map(
    guide => `- [${guide.title}](./${guide.target}): ${oneLine(guide.description) || 'Usage guide.'}`,
  );
  const exampleLines = examples.map(
    guide => `- [${guide.title}](./${guide.target}): ${oneLine(guide.description) || 'Runnable example.'}`,
  );

  const reference = AREA_ORDER.map(area => {
    const items = pages.filter(page => page.area === area.id).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) return '';
    const lines = items.map(page => `- [${page.name}](./reference/${page.area}/${page.slug}.md): ${page.description}`);
    return `### ${area.title}\n\n${lines.join('\n')}`;
  }).filter(Boolean);

  return `# discord-ts-selfbot ${version} — Agent docs

Version-matched documentation for coding agents. Read this file first, then open the page for the task. The reference is generated from the public typings; exact types stay in \`typings/index.d.ts\`.

${[
  section('Start here', startLines),
  section('Guides', usageLines),
  section('Examples', exampleLines),
  section('API reference', [
    ['- [API reference](./reference/index.md): Public runtime surface, grouped by area.', ...reference].join('\n\n'),
  ]),
  hasEvents ? section('Events', ['- [Event catalog](./events/index.md): Events emitted by public classes.']) : '',
]
  .filter(Boolean)
  .join('\n\n')}
`;
}

function renderReadme(version: string): string {
  return `# Agent docs\n\nVersion-matched documentation for \`discord-ts-selfbot@${version}\`.\n\nStart at [\`llms.txt\`](./llms.txt). The \`reference/\` tree is generated from the public typings and the API prose store; the guides and examples are generated from \`apps/docs/content/docs\`. Do not edit this tree by hand.\n\nCopy [\`AGENTS.md\`](./AGENTS.md) into the project \`AGENTS.md\` so coding agents read these docs before they write code.\n`;
}

function renderAgentsMd(): string {
  return `<!-- BEGIN:discord-ts-selfbot-agent-rules -->\n\n# discord-ts-selfbot: read docs before coding\n\nBefore any discord-ts-selfbot work, read \`node_modules/discord-ts-selfbot/docs/llms.txt\` and the page for the task. The bundled docs match the installed version; do not rely on training data for the public API.\n\nThe reference is generated from the public typings. Exact types stay in \`node_modules/discord-ts-selfbot/typings/index.d.ts\`.\n\n<!-- END:discord-ts-selfbot-agent-rules -->\n`;
}

function writeTree(root: string, files: Map<string, string>): void {
  rmSync(root, { recursive: true, force: true });
  for (const [relative, content] of files) {
    const target = path.join(root, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

function compareTrees(expectedRoot: string, actualRoot: string): string[] {
  const expected = new Map(
    walk(expectedRoot).map(file => [path.relative(expectedRoot, file), readFileSync(file, 'utf8')]),
  );
  const actual = new Map(walk(actualRoot).map(file => [path.relative(actualRoot, file), readFileSync(file, 'utf8')]));
  const diffs: string[] = [];

  for (const [file, content] of expected) {
    if (!actual.has(file)) diffs.push(`missing: ${file}`);
    else if (actual.get(file) !== content) diffs.push(`changed: ${file}`);
  }
  for (const file of actual.keys()) {
    if (!expected.has(file)) diffs.push(`unexpected: ${file}`);
  }

  return diffs.sort();
}

export function generateAgentDocs(options: { outputDir: string }): {
  files: string[];
  missing: string[];
  pages: GeneratedPage[];
} {
  const version = (JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')) as { version: string })
    .version;
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'discord-ts-selfbot-agent-'));
  const project = runTypeDoc({
    entryPoints: ['typings/index.d.ts'],
    entryPointStrategy: 'resolve',
    outputJson: path.join(tempDir, 'typings.json'),
    packageDir,
  });
  const typingsByName = reflectionsByName(project);
  const parsed = parseIndexExports(readFileSync(path.join(packageDir, 'src/index.ts'), 'utf8'));
  const store = loadApiStore(path.join(import.meta.dir, 'api.json'));

  const pages: GeneratedPage[] = [];
  const missing: string[] = [];
  const seen = new Set<string>();

  for (const exported of parsed.public) {
    if (seen.has(exported.name)) continue;
    seen.add(exported.name);
    if (exported.typeOnly) continue;

    const reflectionName = TYPINGS_ALIASES[exported.name] ?? exported.name;
    const typings = typingsByName.get(reflectionName);
    if (!typings) {
      if (!KNOWN_UNTYPED_EXPORTS.has(exported.name)) missing.push(exported.name);
      continue;
    }

    if (!isRuntimeKind(typings.kind)) continue;

    const storeEntry = store.get(reflectionName);
    if (typings.kind === Kind.Class) enrichClass(undefined, typings, storeEntry as DocgenClass | undefined);
    else enrichType(typings, storeEntry as DocgenType | undefined);

    const area = areaFor(exported.path);
    const slug = slugify(exported.name);
    const sourceUrl = sourceUrlForEntry(storeEntry, exported.path);
    const markdown =
      typings.kind === Kind.Class
        ? renderClassPage({
            name: exported.name,
            typings,
            events: (storeEntry as DocgenClass | undefined)?.events,
            sourceUrl,
          })
        : typings.kind === Kind.Function
          ? renderFunctionPage({ name: exported.name, typings, sourceUrl })
          : renderVariablePage({ name: exported.name, typings, sourceUrl });

    pages.push({
      area,
      slug,
      name: exported.name,
      reflectionName,
      description: oneLine(summaryText(typings.comment)) || `${exported.name} reference.`,
      markdown,
    });
  }

  const duplicateSlugs = pages
    .map(page => `${page.area}/${page.slug}`)
    .filter((value, index, all) => all.indexOf(value) !== index);
  if (duplicateSlugs.length) {
    throw new Error(`Duplicate reference slugs: ${[...new Set(duplicateSlugs)].join(', ')}`);
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
  if (hasEvents) files.set('events/index.md', eventsIndex);

  for (const guide of guides) {
    const body = rewriteLinks(guide.body, guide.target, links);
    files.set(guide.target, `# ${guide.title}\n\n${body}\n`);
  }

  files.set(
    'llms.txt',
    renderIndex({
      version,
      guides,
      pages,
      hasEvents,
    }),
  );
  files.set('README.md', renderReadme(version));
  files.set('AGENTS.md', renderAgentsMd());

  writeTree(options.outputDir, files);
  rmSync(tempDir, { recursive: true, force: true });

  return { files: [...files.keys()].sort(), missing, pages };
}

function main(): void {
  const check = process.argv.includes('--check');
  const outIndex = process.argv.indexOf('--out');
  const outputDir = outIndex >= 0 ? path.resolve(process.argv[outIndex + 1]) : path.join(packageDir, 'docs');

  if (check) {
    const temp = mkdtempSync(path.join(os.tmpdir(), 'discord-ts-selfbot-agent-check-'));
    try {
      const result = generateAgentDocs({ outputDir: temp });
      const diffs = compareTrees(outputDir, temp);
      if (result.missing.length) {
        console.error(`Missing typings reflections: ${result.missing.join(', ')}`);
        process.exitCode = 1;
      }
      if (diffs.length) {
        console.error(`Agent docs are out of date (${diffs.length} files):`);
        for (const diff of diffs.slice(0, 20)) console.error(`  ${diff}`);
        process.exitCode = 1;
      }
      if (!result.missing.length && !diffs.length) console.log('Agent docs are up to date.');
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
    return;
  }

  const result = generateAgentDocs({ outputDir });
  console.log(`Generated ${result.files.length} agent docs files.`);
  if (result.missing.length) console.warn(`Missing typings reflections: ${result.missing.join(', ')}`);
}

if (import.meta.main) main();
