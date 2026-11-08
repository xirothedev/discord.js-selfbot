import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Comment, Reflection } from './types';

export interface DocgenParam {
  name: string;
  description?: string;
  optional?: boolean;
  default?: string;
  type?: unknown;
}

export interface DocgenMethod {
  name: string;
  description?: string;
  examples?: string[];
  params?: DocgenParam[];
  returns?: { description?: string; types?: unknown } | unknown;
  async?: boolean;
  access?: string;
}

export interface DocgenProp {
  name: string;
  description?: string;
  type?: unknown;
  access?: string;
  readonly?: boolean;
  nullable?: boolean;
  optional?: boolean;
}

export interface DocgenEvent {
  name: string;
  description?: string;
  params?: DocgenParam[];
}

export interface DocgenMeta {
  line?: number;
  file?: string;
  path?: string;
}

export interface DocgenClass {
  name: string;
  description?: string;
  meta?: DocgenMeta;
  construct?: { name: string; params?: DocgenParam[]; description?: string };
  props?: DocgenProp[];
  methods?: DocgenMethod[];
  events?: DocgenEvent[];
}

export interface DocgenType {
  name: string;
  description?: string;
  meta?: DocgenMeta;
  props?: DocgenProp[];
  methods?: DocgenMethod[];
}

export interface DocgenData {
  classes: DocgenClass[];
  interfaces: DocgenType[];
  typedefs: DocgenType[];
}

const SHIM = path.join(import.meta.dir, 'util-shim.cjs');

// @discordjs/docgen parses JavaScript with jsdoc 3.6.11. It cannot read TypeScript,
// so the docs build compiles the source to a temporary JavaScript mirror first.
// Nothing is written into the repository.
function emitDocgenSources(options: { packageDir: string; workDir: string }): void {
  const outDir = path.join(options.workDir, 'src');
  const tsconfig = path.join(options.workDir, 'tsconfig.json');

  writeFileSync(
    tsconfig,
    JSON.stringify(
      {
        extends: path.join(options.packageDir, 'tsconfig.json'),
        compilerOptions: {
          module: 'CommonJS',
          moduleResolution: 'node',
          noEmit: false,
          outDir,
          rootDir: path.join(options.packageDir, 'src'),
          allowJs: false,
          declaration: false,
          sourceMap: false,
          types: ['node'],
        },
        include: [path.join(options.packageDir, 'src/**/*.ts')],
      },
      null,
      2,
    ),
  );

  const tsc = Bun.resolveSync('typescript/bin/tsc', options.packageDir);
  const result = Bun.spawnSync({
    cmd: ['bun', tsc, '-p', tsconfig],
    cwd: options.packageDir,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  if (!existsSync(path.join(outDir, 'index.js'))) {
    const stderr = new TextDecoder().decode(result.stderr);
    throw new Error(`docgen source emit failed (${result.exitCode}):\n${stderr.slice(-4000)}`);
  }
}

export function loadDocgen(options: {
  packageDir: string;
  docsDir: string;
  outputJson: string;
}): Map<string, DocgenClass | DocgenType> {
  // A stable path keeps jsdoc's metadata relative to `src` and avoids leaking
  // a random temp directory into the generated source links.
  const workDir = path.join(os.tmpdir(), 'discord-ts-selfbot-docgen');
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });
  emitDocgenSources({ packageDir: options.packageDir, workDir });

  // jsdoc-api caches parsed template data by file contents and relative paths.
  // A stale entry keeps the temp path from an older build in `meta.path`.
  rmSync(path.join(os.tmpdir(), 'jsdoc-api'), { recursive: true, force: true });

  const docgenConfig = path.join(options.docsDir, 'docgen.yml');
  const docgenBin = Bun.resolveSync('@discordjs/docgen/src/index.js', options.docsDir);
  const nodeOptions = [process.env.NODE_OPTIONS, `--require ${SHIM}`].filter(Boolean).join(' ');

  const result = Bun.spawnSync({
    cmd: ['bun', docgenBin, '--source', 'src', '--custom', docgenConfig, '--output', options.outputJson],
    cwd: workDir,
    env: { ...process.env, NODE_OPTIONS: nodeOptions },
    stdout: 'pipe',
    stderr: 'pipe',
  });

  if (result.exitCode !== 0) {
    const stderr = new TextDecoder().decode(result.stderr);
    throw new Error(`docgen failed (${result.exitCode}):\n${stderr.slice(-4000)}`);
  }

  const data = JSON.parse(readFileSync(options.outputJson, 'utf8')) as DocgenData;
  const byName = new Map<string, DocgenClass | DocgenType>();
  for (const item of [...data.classes, ...data.interfaces, ...data.typedefs]) {
    byName.set(item.name, item);
  }
  return byName;
}

interface Commented {
  comment?: Comment;
}

function ensureSummary(target: Commented | undefined, description?: string): void {
  if (!target || !description) return;

  if (!target.comment) target.comment = { summary: [] };
  if (!target.comment.summary?.length) {
    target.comment.summary = [{ kind: 'text', text: description }];
  }
}

function ensureSignatureSummary(reflection: Reflection | undefined, description?: string): void {
  if (!reflection || !description) return;

  ensureSummary(reflection, description);
  for (const signature of reflection.signatures ?? []) {
    if (!signature.comment) signature.comment = { summary: [] };
    if (!signature.comment.summary?.length) {
      signature.comment.summary = [{ kind: 'text', text: description }];
    }
  }
}

function addBlockTag(comment: Comment, tag: string, text: string): void {
  if (!comment.blockTags) comment.blockTags = [];
  if (!comment.blockTags.some((item) => item.tag === tag)) {
    comment.blockTags.push({ tag, content: [{ kind: 'text', text }] });
  }
}

function ensureReturns(target: Commented | undefined, description?: string): void {
  if (!target || !description) return;
  const comment = target.comment ?? (target.comment = {});
  addBlockTag(comment, '@returns', description);
}

function ensureExamples(target: Commented | undefined, examples: string[] | undefined): void {
  if (!target || !examples?.length) return;
  const comment = target.comment ?? (target.comment = {});
  if (!comment.blockTags) comment.blockTags = [];

  const existing = new Set(
    comment.blockTags
      .filter((item) => item.tag === '@example')
      .map((item) => item.content?.map((part) => part.text ?? '').join('') ?? ''),
  );

  for (const example of examples) {
    const text = `\`\`\`ts\n${example}\n\`\`\``;
    if (!existing.has(text)) {
      comment.blockTags.push({ tag: '@example', content: [{ kind: 'code', text }] });
      existing.add(text);
    }
  }
}

function findChild(reflection: Reflection | undefined, name: string): Reflection | undefined {
  return reflection?.children?.find((child) => child.name === name);
}

export function enrichClass(
  source: Reflection | undefined,
  typings: Reflection | undefined,
  docgenClass: DocgenClass | undefined,
): void {
  if (!docgenClass) return;

  ensureSummary(source, docgenClass.description);
  ensureSummary(typings, docgenClass.description);

  const constructor =
    source?.children?.find((child) => child.kind === 512) ?? typings?.children?.find((child) => child.kind === 512);
  if (docgenClass.construct) {
    ensureSummary(constructor, docgenClass.construct.description);
    for (const signature of constructor?.signatures ?? []) {
      for (const param of docgenClass.construct.params ?? []) {
        ensureSummary(
          signature.parameters?.find((candidate) => candidate.name === param.name),
          param.description,
        );
      }
    }
  }

  for (const prop of docgenClass.props ?? []) {
    ensureSummary(findChild(source, prop.name) ?? findChild(typings, prop.name), prop.description);
  }

  for (const method of docgenClass.methods ?? []) {
    const child = findChild(source, method.name) ?? findChild(typings, method.name);
    ensureSignatureSummary(child, method.description);

    for (const signature of child?.signatures ?? []) {
      for (const param of method.params ?? []) {
        ensureSummary(
          signature.parameters?.find((candidate) => candidate.name === param.name),
          param.description,
        );
      }
      const returns =
        method.returns && typeof method.returns === 'object' && 'description' in method.returns
          ? (method.returns.description as string | undefined)
          : undefined;
      ensureReturns(signature, returns);
      ensureExamples(signature, method.examples);
    }
  }
}

export function enrichType(reflection: Reflection | undefined, docgenType: DocgenType | undefined): void {
  if (!reflection || !docgenType) return;

  ensureSummary(reflection, docgenType.description);
  for (const prop of docgenType.props ?? []) {
    ensureSummary(findChild(reflection, prop.name), prop.description);
  }
  for (const method of docgenType.methods ?? []) {
    const child = findChild(reflection, method.name);
    ensureSignatureSummary(child, method.description);
  }
}
