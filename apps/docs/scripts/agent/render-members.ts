import { plainText, stripJsdocSyntax } from '../api/comment';
import { mergeSignature, signatureLine } from '../api/render-shared';
import type { MergedMember } from '../api/render-shared';
import { renderType } from '../api/render-type';
import type { Comment, DocgenEvent } from '../api/types';

export function summary(comment: Comment | undefined): string {
  const parts = comment?.summary;
  if (!parts?.length) {
    return '';
  }
  return parts
    .map((part) => {
      if (part.kind === 'code') {
        return part.text ?? '';
      }
      return stripJsdocSyntax(part.text ?? '');
    })
    .join('')
    .trim();
}

export function deprecated(comment: Comment | undefined): string {
  const tag = comment?.blockTags?.find((item) => item.tag === '@deprecated');
  if (!tag) {
    return '';
  }
  const text = stripJsdocSyntax(plainText(tag.content)).trim();
  return `> **Deprecated.** ${text || 'This API is deprecated.'}`;
}

export function examples(comment: Comment | undefined): string[] {
  const tags =
    comment?.blockTags?.filter((item) => item.tag === '@example') ?? [];
  return tags
    .map((tag) => {
      const code = tag.content?.find((part) => part.kind === 'code')?.text;
      if (code) {
        return code.trim();
      }
      const text = stripJsdocSyntax(plainText(tag.content)).trim();
      return text ? `\`\`\`ts\n${text}\n\`\`\`` : '';
    })
    .filter(Boolean);
}

export function parameterList(
  parameters: ReturnType<typeof mergeSignature>['parameters']
): string {
  return parameters
    .map((parameter) => {
      const optional =
        parameter.flags?.isOptional || parameter.defaultValue !== undefined
          ? '?'
          : '';
      const description = stripJsdocSyntax(
        plainText(parameter.comment?.summary)
      ).trim();
      const code = `\`${parameter.name}${optional}: ${renderType(parameter.type) ?? 'unknown'}\``;
      return description ? `- ${code} — ${description}` : `- ${code}`;
    })
    .join('\n');
}

export function block(title: string, body: string): string {
  return body.trim() ? `## ${title}\n\n${body.trim()}` : '';
}

export function renderMethod(member: MergedMember): string {
  const sourceSignatures = member.source?.signatures ?? [];
  const typingsSignatures = member.typings?.signatures ?? [];
  const count = Math.max(sourceSignatures.length, typingsSignatures.length);
  const parts: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const merged = mergeSignature(
      sourceSignatures[index],
      typingsSignatures[index]
    );
    const isStatic =
      member.typings?.flags?.isStatic || member.source?.flags?.isStatic;
    const code = signatureLine(
      merged,
      `${isStatic ? 'static ' : ''}${member.name}`
    );
    const description = summary(merged.comment);
    const deprecatedText = deprecated(merged.comment);
    const parameters = parameterList(merged.parameters);
    const returns = merged.returnType
      ? `**Returns:** \`${renderType(merged.returnType) ?? 'unknown'}\``
      : '';
    const exampleBlocks = examples(merged.comment);

    parts.push(
      [
        description,
        deprecatedText,
        '```ts',
        code,
        '```',
        parameters,
        returns,
        ...exampleBlocks,
      ]
        .filter(Boolean)
        .join('\n\n')
    );
  }

  return [`### \`${member.name}\``, ...parts].join('\n\n');
}

function propertyType(member: MergedMember) {
  return (
    member.typings?.type ??
    member.source?.type ??
    member.source?.getSignature?.type
  );
}

function memberFlags(member: MergedMember): string[] {
  const flags: string[] = [];
  const typingsFlags = member.typings?.flags;
  const sourceFlags = member.source?.flags;
  if (typingsFlags?.isReadonly || sourceFlags?.isReadonly) {
    flags.push('readonly');
  }
  if (typingsFlags?.isStatic || sourceFlags?.isStatic) {
    flags.push('static');
  }
  return flags;
}

export function renderProperty(member: MergedMember): string {
  const description = summary(
    member.typings?.comment ?? member.source?.comment
  );
  const flags = memberFlags(member);

  const meta = [
    `**Type:** \`${renderType(propertyType(member)) ?? 'unknown'}\``,
    flags.length ? `**Modifiers:** ${flags.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return [`### \`${member.name}\``, description, meta]
    .filter(Boolean)
    .join('\n\n');
}

export function renderEvent(event: DocgenEvent): string {
  const description = event.description
    ? stripJsdocSyntax(event.description).trim()
    : '';
  const params = (event.params ?? [])
    .map((parameter) => {
      const optional = parameter.optional ? '?' : '';
      const details = parameter.description
        ? ` — ${stripJsdocSyntax(parameter.description).trim()}`
        : '';
      return `- \`${parameter.name}${optional}\`${details}`;
    })
    .join('\n');

  return [`### \`${event.name}\``, description, params]
    .filter(Boolean)
    .join('\n\n');
}
