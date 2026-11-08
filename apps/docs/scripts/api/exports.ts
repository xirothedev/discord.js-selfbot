import type { ParsedExports, PublicExport } from './types';

const EXPORT_LINE = /^exports\.([A-Za-z0-9_]+)\s*=\s*(.+);$/;
const REQUIRE_LINE = /^require\('([^']+)'\)(?:\.([A-Za-z0-9_]+))?$/;

export function parseIndexExports(source: string): ParsedExports {
  const result: ParsedExports = { public: [], aliases: [], external: [], unparsed: [] };

  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('exports.')) continue;

    const match = trimmed.match(EXPORT_LINE);
    if (!match) continue;

    const [, name, rhs] = match;
    if (rhs.startsWith('exports.')) {
      result.aliases.push({ name, target: rhs.slice('exports.'.length) });
      continue;
    }

    if (rhs.startsWith("require('@") || rhs.startsWith('require("@')) {
      result.external.push(name);
      continue;
    }

    const required = rhs.match(REQUIRE_LINE);
    if (!required) {
      result.unparsed.push(`${name} = ${rhs}`);
      continue;
    }

    const [, path, namedExport] = required;
    if (!path.startsWith('./') && !path.startsWith('../')) {
      result.unparsed.push(`${name} = ${rhs}`);
      continue;
    }

    // package metadata is not part of the API reference
    if (path.startsWith('../')) continue;

    result.public.push({ name, path, namedExport });
  }

  return result;
}

export const AREA_ORDER = [
  { id: 'client', title: 'Client' },
  { id: 'structures', title: 'Structures' },
  { id: 'managers', title: 'Managers' },
  { id: 'rest', title: 'REST' },
  { id: 'voice', title: 'Voice' },
  { id: 'sharding', title: 'Sharding' },
  { id: 'utilities', title: 'Utilities' },
  { id: 'packages', title: 'Packages' },
  { id: 'typings', title: 'Typings' },
  { id: 'other', title: 'Other' },
] as const;

export type AreaId = (typeof AREA_ORDER)[number]['id'];

export function areaFor(path: string): AreaId {
  if (path.startsWith('./client/voice')) return 'voice';
  if (path.startsWith('./client')) return 'client';
  if (path.startsWith('./structures')) return 'structures';
  if (path.startsWith('./managers')) return 'managers';
  if (path.startsWith('./rest')) return 'rest';
  if (path.startsWith('./sharding')) return 'sharding';
  if (path.startsWith('./util')) return 'utilities';
  if (path.startsWith('./packages')) return 'packages';
  if (path === './WebSocket') return 'client';
  return 'other';
}

export function slugify(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sortByName(exports: PublicExport[]): PublicExport[] {
  return [...exports].sort((a, b) => a.name.localeCompare(b.name));
}
