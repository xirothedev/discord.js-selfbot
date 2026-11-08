import type { Comment, CommentPart } from './types';

export function stripJsdocSyntax(text: string): string {
  return text
    .replace(
      /\{@link(?:code|plain)?\s+([^}|]+)(?:\|([^}]+))?\}/gi,
      (_match, url: string, label?: string) => label ?? url,
    )
    .replace(/<\/?(?:info|warn|error|note)>/gi, '');
}

export function plainText(parts: CommentPart[] | undefined): string {
  if (!parts) return '';
  return stripJsdocSyntax(
    parts
      .map((part) => {
        if (part.kind === 'code') return part.text ?? '';
        return part.text ?? '';
      })
      .join(''),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeMdx(text: string): string {
  return text.replaceAll('{', '\\{').replaceAll('}', '\\}').replaceAll('<', '\\<').replaceAll('>', '\\>');
}

export function inlineCode(text: string): string {
  const longestRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  const delimiter = '`'.repeat(longestRun + 1);
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
  return `${delimiter}${pad}${text}${pad}${delimiter}`;
}

export function summaryText(comment: Comment | undefined): string {
  return plainText(comment?.summary);
}

export function frontmatterDescription(comment: Comment | undefined, fallback: string): string {
  const text = summaryText(comment) || fallback;
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length > 160 ? `${oneLine.slice(0, 157)}...` : oneLine;
}

export function renderSummary(comment: Comment | undefined): string {
  const parts = comment?.summary;
  if (!parts?.length) return '';

  return parts
    .map((part) => {
      if (part.kind === 'code') {
        const text = part.text ?? '';
        if (text.includes('\n')) return `\n\n\`\`\`ts\n${text}\n\`\`\`\n\n`;
        return inlineCode(text);
      }

      if (part.kind === 'inline-tag') {
        return inlineCode(part.text ?? '');
      }

      return escapeMdx(stripJsdocSyntax(part.text ?? ''));
    })
    .join('')
    .trim();
}

export function renderExamples(comment: Comment | undefined): string {
  const examples = comment?.blockTags?.filter((tag) => tag.tag === '@example') ?? [];
  if (!examples.length) return '';

  return examples
    .map((tag) => {
      const content = tag.content ?? [];
      const code = content.find((part) => part.kind === 'code')?.text;
      if (code) return code.trim();

      const text = plainText(content);
      return text ? `\`\`\`ts\n${text}\n\`\`\`` : '';
    })
    .filter(Boolean)
    .join('\n\n');
}

export function renderDeprecated(comment: Comment | undefined): string {
  const deprecated = comment?.blockTags?.find((tag) => tag.tag === '@deprecated');
  if (!deprecated) return '';

  const text = plainText(deprecated.content);
  return `<Callout type="warn" title="Deprecated">${escapeMdx(text || 'This API is deprecated.')}</Callout>`;
}

export function renderReturns(comment: Comment | undefined): string {
  const returns = comment?.blockTags?.find((tag) => tag.tag === '@returns' || tag.tag === '@return');
  if (!returns) return '';

  const text = plainText(returns.content);
  return text ? `\n\n**Returns:** ${escapeMdx(text)}` : '';
}
