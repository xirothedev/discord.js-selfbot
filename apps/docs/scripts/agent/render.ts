import {
  mergeMembers,
  mergeSignature,
  signatureLine,
} from '../api/render-shared';
import { renderType } from '../api/render-type';
import { Kind } from '../api/types';
import type { DocgenEvent, Reflection } from '../api/types';
import {
  block,
  deprecated,
  examples,
  parameterList,
  renderEvent,
  renderMethod,
  renderProperty,
  summary,
} from './render-members';

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

const ERROR_MEMBERS = new Set([
  'captureStackTrace',
  'cause',
  'isError',
  'message',
  'name',
  'prepareStackTrace',
  'stack',
  'stackTraceLimit',
]);

export interface RenderClassInput {
  name: string;
  typings: Reflection;
  events?: DocgenEvent[];
  sourceUrl?: string;
}

export function renderClassPage(input: RenderClassInput): string {
  const { name, typings, events } = input;
  const extendsError = (typings.extendedTypes ?? []).some(
    (type) => type.name === 'Error'
  );
  const hidden = extendsError
    ? new Set([...HIDDEN_MEMBERS, ...ERROR_MEMBERS])
    : HIDDEN_MEMBERS;
  const members = mergeMembers(undefined, typings).filter(
    (member) =>
      !member.name.startsWith('_') &&
      !hidden.has(member.name) &&
      !member.typings?.flags?.isPrivate &&
      !member.typings?.flags?.isProtected
  );
  const constructor = members.find((member) => member.kind === 'constructor');
  const properties = members
    .filter(
      (member) => member.kind === 'property' || member.kind === 'accessor'
    )
    .toSorted((left, right) => left.name.localeCompare(right.name));
  const methods = members
    .filter((member) => member.kind === 'method')
    .toSorted((left, right) => left.name.localeCompare(right.name));

  const heritage = [
    ...(typings.extendedTypes ?? []).map(
      (type) => `extends ${renderType(type)}`
    ),
    ...(typings.implementedTypes ?? []).map(
      (type) => `implements ${renderType(type)}`
    ),
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
    properties.length
      ? block(
          'Properties',
          properties.map((member) => renderProperty(member)).join('\n\n')
        )
      : '',
    methods.length
      ? block(
          'Methods',
          methods.map((member) => renderMethod(member)).join('\n\n')
        )
      : '',
    events?.length
      ? block('Events', events.map((event) => renderEvent(event)).join('\n\n'))
      : '',
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
  const parts = signatures.map((signature) => {
    const merged = mergeSignature(signature, undefined);
    return [
      summary(merged.comment),
      deprecated(merged.comment),
      '```ts',
      signatureLine(merged, input.name),
      '```',
      parameterList(merged.parameters),
      merged.returnType
        ? `**Returns:** \`${renderType(merged.returnType) ?? 'unknown'}\``
        : '',
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
  const isEnum =
    members?.length &&
    members.every((member) => member.type?.type === 'literal');
  const enumMembers = isEnum
    ? members
        .map((member) => {
          const value = member.type?.value;
          const rendered =
            typeof value === 'string'
              ? JSON.stringify(value)
              : String(value ?? '');
          const description = summary(member.comment);
          return `- \`${member.name}\`${rendered ? ` = ${rendered}` : ''}${description ? ` — ${description}` : ''}`;
        })
        .join('\n')
    : '';

  return [
    `# ${input.name}`,
    summary(input.typings.comment),
    deprecated(input.typings.comment),
    input.typings.type
      ? `**Type:** \`${renderType(input.typings.type) ?? 'unknown'}\``
      : '',
    enumMembers ? `## Members\n\n${enumMembers}` : '',
    examples(input.typings.comment).join('\n\n'),
    input.sourceUrl ? `---\n\nSource: ${input.sourceUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}

export function isRuntimeKind(kind: number): boolean {
  return (
    kind === Kind.Class || kind === Kind.Function || kind === Kind.Variable
  );
}
