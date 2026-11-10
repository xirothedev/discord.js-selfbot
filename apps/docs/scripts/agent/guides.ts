import { readFileSync } from 'node:fs';
import path from 'node:path';

import { convertMdx } from './mdx';
import { walk } from './tree';

const docsDir = path.resolve(import.meta.dir, '../..');
const contentDir = path.join(docsDir, 'content/docs');
const siteBase = 'https://xirothedev.github.io/discord.js-selfbot';

export interface GeneratedPage {
  area: string;
  slug: string;
  name: string;
  reflectionName: string;
  description: string;
  markdown: string;
}

export interface GeneratedGuide {
  source: string;
  target: string;
  title: string;
  description: string;
  body: string;
}

function readIfExists(file: string): string | undefined {
  try {
    return readFileSync(file, 'utf-8');
  } catch {
    return undefined;
  }
}

export function collectGuides(): GeneratedGuide[] {
  const guides: GeneratedGuide[] = [];
  const add = (source: string, target: string) => {
    const text = readIfExists(source);
    if (!text) {
      return;
    }
    const converted = convertMdx(text, {
      include: (file) => readIfExists(path.resolve(docsDir, file)),
    });
    guides.push({
      body: converted.body,
      description: converted.description ?? '',
      source,
      target,
      title: converted.title,
    });
  };

  add(path.join(contentDir, 'index.mdx'), 'index.md');
  for (const group of ['getting-started', 'guides', 'examples']) {
    const root = path.join(contentDir, group);
    for (const file of walk(root).filter((candidate) =>
      candidate.endsWith('.mdx')
    )) {
      const name = path.basename(file, '.mdx');
      add(file, `${group}/${name}.md`);
    }
  }

  return guides.toSorted((left, right) =>
    left.target.localeCompare(right.target)
  );
}

export function buildLinkMap(
  reference: GeneratedPage[],
  guides: GeneratedGuide[]
): Map<string, string> {
  const links = new Map([
    ['/docs', 'index.md'],
    ['/docs/api', 'reference/index.md'],
  ]);

  for (const guide of guides) {
    const { target } = guide;
    if (target === 'index.md') {
      continue;
    }
    const [group, name] = target.split('/');
    if (group === 'getting-started') {
      links.set(`/docs/getting-started/${name.replace(/\.md$/u, '')}`, target);
    }
    if (group === 'guides') {
      links.set(`/docs/guides/${name.replace(/\.md$/u, '')}`, target);
    }
    if (group === 'examples') {
      links.set(`/docs/examples/${name.replace(/\.md$/u, '')}`, target);
    }
  }

  for (const page of reference) {
    links.set(
      `/docs/api/${page.area}/${page.slug}`,
      `reference/${page.area}/${page.slug}.md`
    );
  }

  return links;
}

function fallbackFor(target: string): string | undefined {
  if (target === '/docs/examples') {
    return 'examples/index.md';
  }
  if (target === '/docs/getting-started') {
    return 'getting-started/installation.md';
  }
  if (target.startsWith('/docs/api/')) {
    return 'reference/index.md';
  }
  return undefined;
}

export function rewriteLinks(
  body: string,
  current: string,
  links: Map<string, string>
): string {
  return body.replaceAll(
    /\[(?<label>[^\]]+)\]\((?<target>\/docs[^)\s#]*)(?<hash>#[^)]*)?\)/gu,
    (match, label: string, target: string, hash: string | undefined) => {
      const mapped = links.get(target);
      if (mapped) {
        const relative = path.posix.relative(
          path.posix.dirname(current),
          mapped
        );
        return `[${label}](${relative}${hash ?? ''})`;
      }

      const fallback = fallbackFor(target);
      if (fallback) {
        const relative = path.posix.relative(
          path.posix.dirname(current),
          fallback
        );
        return `[${label}](${relative}${hash ?? ''})`;
      }

      if (target.startsWith('/docs/project/')) {
        return `[${label}](${siteBase}${target}${hash ?? ''})`;
      }

      return match;
    }
  );
}

export function oneLine(text: string | undefined, limit = 140): string {
  const value = (text ?? '').replaceAll(/\s+/gu, ' ').trim();
  if (!value) {
    return '';
  }
  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}
