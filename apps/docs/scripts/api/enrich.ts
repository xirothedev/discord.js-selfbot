import { readFileSync } from 'node:fs';
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
  returns?: { description?: string } | unknown;
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
  construct?: { name?: string; params?: DocgenParam[]; description?: string };
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

export interface ApiStore {
  classes?: DocgenClass[];
  interfaces?: DocgenType[];
  typedefs?: DocgenType[];
}

export function loadApiStore(file: string): Map<string, DocgenClass | DocgenType> {
  const store = JSON.parse(readFileSync(file, 'utf8')) as ApiStore;
  const byName = new Map<string, DocgenClass | DocgenType>();
  for (const entry of [...(store.classes ?? []), ...(store.interfaces ?? []), ...(store.typedefs ?? [])]) {
    byName.set(entry.name, entry);
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
