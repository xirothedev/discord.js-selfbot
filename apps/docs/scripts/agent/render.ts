import { plainText, stripJsdocSyntax } from '../api/comment';
import { mergeMembers, mergeSignature, signatureLine } from '../api/render-shared';
import type { MergedMember } from '../api/render-shared';
import { renderType } from '../api/render-type';
import { Kind } from '../api/types';
import type { Comment, DocgenEvent, Reflection } from '../api/types';

const HIDDEN_MEMBERS = new Set([
  '[captureRejectionSymbol]',
  'addAbortListener',
  'addListener',
  'captureRejectionSymbol',
  'captureRejections',
  'defaultMaxListeners',
  'emit',
  'errorMonitor',
  'eventNames',
  'getEventListeners',
  'getMaxListeners',
  'listenerCount',
  'listeners',
  'off',
  'on',
  'once',
  'prependListener',
  'prependOnceListener',
  'rawListeners',
  'removeAllListeners',
  'removeListener',
  'setMaxListeners',
  'authenticator',
  'token',
]);

function summary(comment: Comment | undefined): string {
  const parts = comment?.summary;
  if (!parts?.length) return '';
  return parts
    .map(part => {
      if (part.kind === 'code') return part.text ?? '';
      return stripJsdocSyntax(part.text ?? '');
    })
    .join('')
    .trim();
}

function deprecated(comment: Comment | undefined): string {
  const tag = comment?.blockTags?.find(item => item.tag === '@deprecated');
  if (!tag) return '';
  const text = stripJsdocSyntax(plainText(tag.content)).trim();
  return `> **Deprecated.** ${text || 'This API is deprecated.'}`;
}

function examples(comment: Comment | undefined): string[] {
  const tags = comment?.blockTags?.filter(item => item.tag === '@example') ?? [];
  return tags
    .map(tag => {
      const code = tag.content?.find(part => part.kind === 'code')?.text;
      if (code) return code.trim();
      const text = stripJsdocSyntax(plainText(tag.content)).trim();
      return text ? `\`\`\`ts\n${text}\n\`\`\`` : '';
    })
    .filter(Boolean);
}

function parameterList(parameters: ReturnType<typeof mergeSignature>['parameters']): string {
  return parameters
    .map(parameter => {
      const optional = parameter.flags?.isOptional || parameter.defaultValue !== undefined ? '?' : '';
      const description = stripJsdocSyntax(plainText(parameter.comment?.summary)).trim();
      const code = `\`${parameter.name}${optional}: ${renderType(parameter.type) ?? 'unknown'}\``;
      return description ? `- ${code} — ${description}` : `- ${code}`;
    })
    .join('\n');
}

function block(title: string, body: string): string {
  return body.trim() ? `## ${title}\n\n${body.trim()}` : '';
}

function renderMethod(member: MergedMember): string {
  const sourceSignatures = member.source?.signatures ?? [];
  const typingsSignatures = member.typings?.signatures ?? [];
  const count = Math.max(sourceSignatures.length, typingsSignatures.length);
  const parts: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const merged = mergeSignature(sourceSignatures[index], typingsSignatures[index]);
    const isStatic = member.typings?.flags?.isStatic || member.source?.flags?.isStatic;
    const code = signatureLine(merged, `${isStatic ? 'static ' : ''}${member.name}`);
    const description = summary(merged.comment);
    const deprecatedText = deprecated(merged.comment);
    const parameters = parameterList(merged.parameters);
    const returns = merged.returnType ? `**Returns:** \`${renderType(merged.returnType) ?? 'unknown'}\`` : '';
    const exampleBlocks = examples(merged.comment);

    parts.push(
      [description, deprecatedText, '```ts', code, '```', parameters, returns, ...exampleBlocks]
        .filter(Boolean)
        .join('\n\n'),
    );
  }

  return [`### \`${member.name}\``, ...parts].join('\n\n');
}

function renderProperty(member: MergedMember): string {
  const type = member.typings?.type ?? member.source?.type ?? member.source?.getSignature?.type;
  const description = summary(member.typings?.comment ?? member.source?.comment);
  const flags: string[] = [];
  if (member.typings?.flags?.isReadonly || member.source?.flags?.isReadonly) flags.push('readonly');
  if (member.typings?.flags?.isStatic || member.source?.flags?.isStatic) flags.push('static');

  const meta = [
    `**Type:** \`${renderType(type) ?? 'unknown'}\``,
    flags.length ? `**Modifiers:** ${flags.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return [`### \`${member.name}\``, description, meta].filter(Boolean).join('\n\n');
}

function renderEvent(event: DocgenEvent): string {
  const description = event.description ? stripJsdocSyntax(event.description).trim() : '';
  const params = (event.params ?? [])
    .map(parameter => {
      const optional = parameter.optional ? '?' : '';
      const details = parameter.description ? ` — ${stripJsdocSyntax(parameter.description).trim()}` : '';
      return `- \`${parameter.name}${optional}\`${details}`;
    })
    .join('\n');

  return [`### \`${event.name}\``, description, params].filter(Boolean).join('\n\n');
}

export interface RenderClassInput {
  name: string;
  typings: Reflection;
  events?: DocgenEvent[];
  sourceUrl?: string;
}

export function renderClassPage(input: RenderClassInput): string {
  const { name, typings, events } = input;
  const members = mergeMembers(undefined, typings).filter(
    member =>
      !member.name.startsWith('_') &&
      !HIDDEN_MEMBERS.has(member.name) &&
      !member.typings?.flags?.isPrivate &&
      !member.typings?.flags?.isProtected,
  );
  const constructor = members.find(member => member.kind === 'constructor');
  const properties = members
    .filter(member => member.kind === 'property' || member.kind === 'accessor')
    .sort((a, b) => a.name.localeCompare(b.name));
  const methods = members.filter(member => member.kind === 'method').sort((a, b) => a.name.localeCompare(b.name));

  const heritage = [
    ...(typings.extendedTypes ?? []).map(type => `extends ${renderType(type)}`),
    ...(typings.implementedTypes ?? []).map(type => `implements ${renderType(type)}`),
  ].join(' ');
  const declaration = `${typings.flags?.isAbstract ? 'abstract ' : ''}class ${name}${heritage ? ` ${heritage}` : ''}`;

  const parts = [
    `# ${name}`,
    summary(typings.comment),
    deprecated(typings.comment),
    '```ts',
    declaration,
    '```',
    constructor ? block('Constructor', renderMethod(constructor)) : '',
    properties.length ? block('Properties', properties.map(member => renderProperty(member)).join('\n\n')) : '',
    methods.length ? block('Methods', methods.map(member => renderMethod(member)).join('\n\n')) : '',
    events?.length ? block('Events', events.map(event => renderEvent(event)).join('\n\n')) : '',
    input.sourceUrl ? `---\n\nSource: ${input.sourceUrl}` : '',
  ];

  return `${parts.filter(Boolean).join('\n\n')}\n`;
}

export interface RenderFunctionInput {
  name: string;
  typings: Reflection;
  sourceUrl?: string;
}

export function renderFunctionPage(input: RenderFunctionInput): string {
  const signatures = input.typings.signatures ?? [];
  const parts = signatures.map(signature => {
    const merged = mergeSignature(signature, undefined);
    return [
      summary(merged.comment),
      deprecated(merged.comment),
      '```ts',
      signatureLine(merged, input.name),
      '```',
      parameterList(merged.parameters),
      merged.returnType ? `**Returns:** \`${renderType(merged.returnType) ?? 'unknown'}\`` : '',
      ...examples(merged.comment),
    ]
      .filter(Boolean)
      .join('\n\n');
  });

  return [
    `# ${input.name}`,
    summary(input.typings.comment),
    deprecated(input.typings.comment),
    ...parts,
    input.sourceUrl ? `---\n\nSource: ${input.sourceUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}

export interface RenderVariableInput {
  name: string;
  typings: Reflection;
  sourceUrl?: string;
}

export function renderVariablePage(input: RenderVariableInput): string {
  const members = input.typings.type?.declaration?.children;
  const isEnum = members?.length && members.every(member => member.type?.type === 'literal');
  const enumMembers = isEnum
    ? members
        .map(member => {
          const value = member.type?.value;
          const rendered = typeof value === 'string' ? JSON.stringify(value) : String(value ?? '');
          const description = summary(member.comment);
          return `- \`${member.name}\`${rendered ? ` = ${rendered}` : ''}${description ? ` — ${description}` : ''}`;
        })
        .join('\n')
    : '';

  return [
    `# ${input.name}`,
    summary(input.typings.comment),
    deprecated(input.typings.comment),
    input.typings.type ? `**Type:** \`${renderType(input.typings.type) ?? 'unknown'}\`` : '',
    enumMembers ? `## Members\n\n${enumMembers}` : '',
    examples(input.typings.comment).join('\n\n'),
    input.sourceUrl ? `---\n\nSource: ${input.sourceUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}

export function isRuntimeKind(kind: number): boolean {
  return kind === Kind.Class || kind === Kind.Function || kind === Kind.Variable;
}
