import { AREA_ORDER } from '../api/exports';
import { stripJsdocSyntax } from '../api/comment';
import type { DocgenClass, DocgenType } from '../api/enrich';
import type { GeneratedGuide, GeneratedPage } from './guides';
import { oneLine } from './guides';

export const KNOWN_UNTYPED_EXPORTS = new Set(['WebSocket']);

function section(title: string, entries: string[]): string {
  return entries.length ? `## ${title}\n\n${entries.join('\n')}` : '';
}

export function renderReferenceIndex(
  pages: GeneratedPage[],
  version: string
): string {
  const sections = AREA_ORDER.map((area) => {
    const items = pages
      .filter((page) => page.area === area.id)
      .toSorted((left, right) => left.name.localeCompare(right.name));
    if (!items.length) {
      return '';
    }
    const lines = items.map(
      (page) =>
        `- [${page.name}](./${area.id}/${page.slug}.md): ${page.description}`
    );
    return `### ${area.title}\n\n${lines.join('\n')}`;
  });

  const gaps = [...KNOWN_UNTYPED_EXPORTS]
    .toSorted()
    .map(
      (name) =>
        `- \`${name}\`: runtime shim, not described by the public typings.`
    )
    .join('\n');

  return `# API reference\n\nPublic runtime surface of \`discord-ts-selfbot@${version}\`. Every page is generated from \`typings/index.d.ts\`.\n\nType-only exports stay in \`typings/index.d.ts\`; this reference does not repeat them.\n\n${sections.filter(Boolean).join('\n\n')}${gaps ? `\n\n## Known gaps\n\n${gaps}` : ''}\n`;
}

export function renderEventsIndex(
  pages: GeneratedPage[],
  store: Map<string, DocgenClass | DocgenType>
): string {
  const publicNames = new Set(pages.map((page) => page.name));
  const sections: string[] = [];

  for (const page of pages.toSorted((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    const classEvents = (
      store.get(page.reflectionName) as DocgenClass | undefined
    )?.events;
    if (!classEvents?.length || !publicNames.has(page.name)) {
      continue;
    }

    const lines = classEvents.map((event) => {
      const description = oneLine(stripJsdocSyntax(event.description ?? ''));
      return `- [\`${event.name}\`](../reference/${page.area}/${page.slug}.md#events): ${description || 'No description.'}`;
    });

    sections.push(`## ${page.name}\n\n${lines.join('\n')}`);
  }

  return `# Event catalog\n\nEvents emitted by public classes. Each entry links to the class reference.\n\n${sections.join('\n\n')}\n`;
}

export function renderIndex(input: {
  version: string;
  guides: GeneratedGuide[];
  pages: GeneratedPage[];
  hasEvents: boolean;
}): string {
  const { version, guides, pages, hasEvents } = input;

  const startOrder = new Map(
    [
      'index.md',
      'getting-started/installation.md',
      'getting-started/token-safety.md',
      'getting-started/first-client.md',
      'getting-started/agents.md',
      'getting-started/migration-v13.md',
    ].map((target, index) => [target, index])
  );
  const start = guides
    .filter(
      (guide) =>
        guide.target === 'index.md' ||
        guide.target.startsWith('getting-started/')
    )
    .toSorted(
      (left, right) =>
        (startOrder.get(left.target) ?? 99) -
        (startOrder.get(right.target) ?? 99)
    );
  const usage = guides.filter((guide) => guide.target.startsWith('guides/'));
  const examples = guides.filter((guide) =>
    guide.target.startsWith('examples/')
  );

  const startLines = [
    '- [AGENTS.md block](./AGENTS.md): Copy this block into the project AGENTS.md before coding.',
    ...start.map(
      (guide) =>
        `- [${guide.title}](./${guide.target}): ${oneLine(guide.description) || 'Start here.'}`
    ),
  ];
  const usageLines = usage.map(
    (guide) =>
      `- [${guide.title}](./${guide.target}): ${oneLine(guide.description) || 'Usage guide.'}`
  );
  const exampleLines = examples.map(
    (guide) =>
      `- [${guide.title}](./${guide.target}): ${oneLine(guide.description) || 'Runnable example.'}`
  );

  const reference = AREA_ORDER.map((area) => {
    const items = pages
      .filter((page) => page.area === area.id)
      .toSorted((left, right) => left.name.localeCompare(right.name));
    if (!items.length) {
      return '';
    }
    const lines = items.map(
      (page) =>
        `- [${page.name}](./reference/${page.area}/${page.slug}.md): ${page.description}`
    );
    return `### ${area.title}\n\n${lines.join('\n')}`;
  }).filter(Boolean);

  return `# discord-ts-selfbot ${version} — Agent docs

Version-matched documentation for coding agents. Read this file first, then open the page for the task. The reference is generated from the public typings; exact types stay in \`typings/index.d.ts\`.

${[
  section('Start here', startLines),
  section('Guides', usageLines),
  section('Examples', exampleLines),
  section('API reference', [
    [
      '- [API reference](./reference/index.md): Public runtime surface, grouped by area.',
      ...reference,
    ].join('\n\n'),
  ]),
  hasEvents
    ? section('Events', [
        '- [Event catalog](./events/index.md): Events emitted by public classes.',
      ])
    : '',
]
  .filter(Boolean)
  .join('\n\n')}
`;
}

export function renderReadme(version: string): string {
  return `# Agent docs\n\nVersion-matched documentation for \`discord-ts-selfbot@${version}\`.\n\nStart at [\`llms.txt\`](./llms.txt). The \`reference/\` tree is generated from the public typings and the API prose store; the guides and examples are generated from \`apps/docs/content/docs\`. Do not edit this tree by hand.\n\nCopy [\`AGENTS.md\`](./AGENTS.md) into the project \`AGENTS.md\` so coding agents read these docs before they write code.\n`;
}

export function renderAgentsMd(): string {
  return `<!-- BEGIN:discord-ts-selfbot-agent-rules -->\n\n# discord-ts-selfbot: read docs before coding\n\nBefore any discord-ts-selfbot work, read \`node_modules/discord-ts-selfbot/docs/llms.txt\` and the page for the task. The bundled docs match the installed version; do not rely on training data for the public API.\n\nThe reference is generated from the public typings. Exact types stay in \`node_modules/discord-ts-selfbot/typings/index.d.ts\`.\n\n<!-- END:discord-ts-selfbot-agent-rules -->\n`;
}
