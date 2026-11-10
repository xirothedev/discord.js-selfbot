import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { frontmatterDescription, renderSummary } from './comment';
import { enrichClass, enrichType, loadDocgen } from './docgen';
import type { DocgenClass, DocgenType } from './docgen';
import { AREA_ORDER, areaFor, parseIndexExports, slugify } from './exports';
import { renderClassPage } from './render-class';
import { renderApiIndex, renderAreaIndex } from './render-index';
import { renderEnumMembersPage, renderFunctionPage, renderVariablePage } from './render-misc';
import { renderTypingsPage } from './render-typings';
import { reflectionsByName, runTypeDoc, sourceUrlFor } from './typedoc';
import { Kind } from './types';
import type { PublicExport, Reflection, Signature, TypeNode, TypeParameter } from './types';
import { TYPINGS_GROUPS, typingsGroupFor } from './typings-groups';
import type { TypingsGroupId } from './typings-groups';

const docsDir = path.resolve(import.meta.dir, '../..');
const repoRoot = path.resolve(docsDir, '../..');
const packageDir = path.join(repoRoot, 'packages/discord-ts-selfbot');
const apiDir = path.join(docsDir, 'content/docs/api');

interface GenerateResult {
  ok: boolean;
  files: string[];
}

interface PageItem {
  title: string;
  href: string;
  description?: string;
}

interface ReflectionLike {
  type?: TypeNode;
  children?: Reflection[];
  signatures?: Signature[];
  typeParameters?: TypeParameter[];
  extendedTypes?: TypeNode[];
  implementedTypes?: TypeNode[];
  getSignature?: Signature;
  setSignature?: Signature;
}

function meta(title: string, pages: string[]): string {
  return `${JSON.stringify({ title, pages }, null, 2)}\n`;
}

function collectTypeNode(node: TypeNode | undefined, out: Set<string>): void {
  if (!node) return;

  if (node.type === 'reference' && node.name) out.add(node.name);
  for (const type of node.types ?? []) collectTypeNode(type, out);
  for (const type of node.typeArguments ?? []) collectTypeNode(type, out);
  for (const type of node.elements ?? []) collectTypeNode(type, out);
  collectTypeNode(node.elementType, out);
  collectTypeNode(node.objectType, out);
  collectTypeNode(node.indexType, out);
  collectTypeNode(node.queryType, out);
  collectTypeNode(node.checkType, out);
  collectTypeNode(node.extendsType, out);
  collectTypeNode(node.trueType, out);
  collectTypeNode(node.falseType, out);

  if (node.declaration) collectReflectionNames(node.declaration, out);
}

function collectReflectionNames(reflection: ReflectionLike, out: Set<string>): void {
  collectTypeNode(reflection.type, out);

  for (const child of reflection.children ?? []) collectReflectionNames(child, out);
  for (const signature of reflection.signatures ?? []) {
    collectTypeNode(signature.type, out);
    for (const parameter of signature.parameters ?? []) collectTypeNode(parameter.type, out);
    for (const typeParameter of signature.typeParameters ?? []) collectTypeNode(typeParameter.type, out);
  }
  for (const typeParameter of reflection.typeParameters ?? []) collectTypeNode(typeParameter.type, out);
  for (const type of reflection.extendedTypes ?? []) collectTypeNode(type, out);
  for (const type of reflection.implementedTypes ?? []) collectTypeNode(type, out);
  if (reflection.getSignature) collectReflectionNames(reflection.getSignature, out);
  if (reflection.setSignature) collectReflectionNames(reflection.setSignature, out);
}

function enumMembers(reflection: Reflection | undefined): Reflection[] | undefined {
  if (!reflection || reflection.kind !== Kind.Variable) return undefined;
  const members = reflection.type?.declaration?.children;
  if (!members?.length) return undefined;
  return members.every((member) => member.type?.type === 'literal') ? members : undefined;
}

function docgenSourceUrl(entry: DocgenClass | DocgenType | undefined): string | undefined {
  const meta = entry?.meta;
  if (!meta?.file) return undefined;
  const full = [meta.path, meta.file].filter(Boolean).join('/').replace(/\.js$/, '.ts');
  return `https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/${full}#L${
    meta.line ?? 1
  }`;
}

function renderPublicPage(input: {
  exported: PublicExport;
  typings?: Reflection;
  sourceUrl?: string;
  docgen?: DocgenClass | DocgenType;
  privateMembers?: string[];
}): string | undefined {
  const { typings } = input;
  if (!typings) return undefined;

  const pageInput = {
    name: input.exported.name,
    typings,
    sourceUrl: input.sourceUrl,
  };

  const members = enumMembers(typings);
  if (members) {
    return renderEnumMembersPage({
      name: input.exported.name,
      members,
      description: renderSummary(typings.comment),
      sourceUrl: input.sourceUrl,
    });
  }

  if (typings.kind === Kind.Class) {
    return renderClassPage({
      name: input.exported.name,
      typings,
      sourceUrl: input.sourceUrl,
      events: (input.docgen as DocgenClass | undefined)?.events,
      privateMembers: input.privateMembers,
    });
  }

  if (typings.kind === Kind.Interface || typings.kind === Kind.TypeAlias) {
    return renderTypingsPage({ title: input.exported.name, reflections: [typings], sourceUrl: input.sourceUrl });
  }

  if (typings.signatures?.length) return renderFunctionPage(pageInput);
  return renderVariablePage(pageInput);
}

function isTypingsKind(kind: number): boolean {
  return kind === Kind.Interface || kind === Kind.TypeAlias || kind === Kind.Variable || kind === Kind.Function;
}

function collectFiles(root: string, current = root): Map<string, string> {
  const files = new Map<string, string>();
  if (!existsSync(current)) return files;

  for (const entry of readdirSync(current)) {
    const full = path.join(current, entry);
    if (statSync(full).isDirectory()) {
      for (const [file, content] of collectFiles(root, full)) files.set(file, content);
    } else {
      files.set(path.relative(root, full), readFileSync(full, 'utf8'));
    }
  }
  return files;
}

function compareOutputs(outputs: Map<string, string>): GenerateResult {
  const existing = collectFiles(apiDir);
  const missing = [...outputs.keys()].filter((file) => !existing.has(file));
  const extra = [...existing.keys()].filter((file) => !outputs.has(file));
  const changed = [...outputs.keys()].filter((file) => existing.has(file) && existing.get(file) !== outputs.get(file));

  if (missing.length || extra.length || changed.length) {
    console.error('API reference is stale.');
    if (missing.length) console.error(`Missing: ${missing.slice(0, 10).join(', ')}`);
    if (extra.length) console.error(`Extra: ${extra.slice(0, 10).join(', ')}`);
    if (changed.length) console.error(`Changed: ${changed.slice(0, 10).join(', ')}`);
    return { ok: false, files: [...outputs.keys()] };
  }

  return { ok: true, files: [...outputs.keys()] };
}

function writeOutputs(outputs: Map<string, string>): GenerateResult {
  rmSync(apiDir, { recursive: true, force: true });
  for (const [file, content] of outputs) {
    const full = path.join(docsDir, 'content/docs', file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content.endsWith('\n') ? content : `${content}\n`);
  }
  return { ok: true, files: [...outputs.keys()] };
}

export function generateApi(options: { check?: boolean } = {}): GenerateResult {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'discord-ts-selfbot-api-'));
  const typingsProject = runTypeDoc({
    entryPoints: ['typings/index.d.ts'],
    entryPointStrategy: 'resolve',
    outputJson: path.join(tempDir, 'typings.json'),
    packageDir,
  });

  const parsed = parseIndexExports(readFileSync(path.join(packageDir, 'src/index.ts'), 'utf8'));
  const version = (JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')) as { version: string })
    .version;
  const typingsReflections = reflectionsByName(typingsProject);
  const docgen = loadDocgen({
    packageDir,
    docsDir,
    outputJson: path.join(tempDir, 'docgen.json'),
  });
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

    const docgenEntry = docgen.get(exported.name);
    enrichClass(undefined, typings, docgenEntry);
    enrichType(typings, docgenEntry);
    const privateMembers =
      (docgenEntry as DocgenClass | undefined)?.props
        ?.filter((prop) => prop.access === 'private')
        .map((prop) => prop.name) ?? [];
    const sourceUrl = docgenSourceUrl(docgenEntry) ?? sourceUrlFor(typings);
    const area = areaFor(exported.path);
    const slug = slugify(exported.name);
    const page = renderPublicPage({
      exported,
      typings,
      sourceUrl,
      docgen: docgenEntry,
      privateMembers,
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
        title: exported.name,
        href: `/docs/api/${area}/${slug}`,
        description: frontmatterDescription(typings.comment, `${exported.name} API reference.`),
      },
    ]);
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }

  const referencedNames = new Set<string>();
  for (const reflection of publicReflections) collectReflectionNames(reflection, referencedNames);

  const typingsOnly = [...typingsReflections.values()].filter(
    (reflection) =>
      !publicNames.has(reflection.name) && referencedNames.has(reflection.name) && isTypingsKind(reflection.kind),
  );
  for (const reflection of typingsOnly) enrichType(reflection, docgen.get(reflection.name));

  const typingsGroups = new Map<TypingsGroupId, Reflection[]>();
  for (const reflection of typingsOnly) {
    const group = typingsGroupFor(reflection.name);
    typingsGroups.set(group, [...(typingsGroups.get(group) ?? []), reflection]);
  }

  const typingsItems: PageItem[] = [];
  let typingsCount = 0;
  for (const group of TYPINGS_GROUPS) {
    const reflections = typingsGroups.get(group.id);
    if (!reflections?.length) continue;

    outputs.set(
      `api/typings/${group.id}.mdx`,
      renderTypingsPage({
        title: group.title,
        reflections,
        sourceUrl: sourceUrlFor(reflections[0]),
      }),
    );
    typingsItems.push({
      title: group.title,
      href: `/docs/api/typings/${group.id}`,
      description: `${reflections.length} public types.`,
    });
    typingsCount += reflections.length;
  }

  if (typingsItems.length) {
    areaItems.set('typings', typingsItems);
    areaCounts.set('typings', typingsCount);
    outputs.set(
      'api/typings/index.mdx',
      renderAreaIndex({
        title: 'Typings',
        description: 'Public interfaces, type aliases, variables, and functions from typings/index.d.ts.',
        items: typingsItems,
      }),
    );
    outputs.set(
      'api/typings/meta.json',
      meta('Typings', ['index', ...typingsItems.map((item) => path.basename(item.href))]),
    );
  }

  for (const [area, items] of areaItems) {
    const sorted = [...items].sort((a, b) => a.title.localeCompare(b.title));
    const areaMeta = AREA_ORDER.find((entry) => entry.id === area);
    outputs.set(
      `api/${area}/index.mdx`,
      renderAreaIndex({
        title: areaMeta?.title ?? area,
        description: `Public ${areaMeta?.title.toLowerCase() ?? area} API.`,
        items: sorted,
      }),
    );
    outputs.set(
      `api/${area}/meta.json`,
      meta(areaMeta?.title ?? area, ['index', ...sorted.map((item) => path.basename(item.href))]),
    );
  }

  const indexAreas = AREA_ORDER.map((area) => ({ ...area, count: areaCounts.get(area.id) ?? 0 }));
  outputs.set(
    'api/index.mdx',
    renderApiIndex({
      areas: indexAreas,
      aliases: parsed.aliases.map((item) => item.name),
      external: parsed.external,
      skipped,
      version,
    }),
  );
  outputs.set(
    'api/meta.json',
    meta('API Reference', ['index', ...indexAreas.filter((area) => area.count > 0).map((area) => area.id)]),
  );

  return options.check ? compareOutputs(outputs) : writeOutputs(outputs);
}
