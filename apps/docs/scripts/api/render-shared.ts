import { escapeMdx, inlineCode, plainText, renderSummary } from "./comment";
import { renderType, renderTypeParameters } from "./render-type";
import { Kind } from "./types";
import type {
  Comment,
  Parameter,
  Reflection,
  Signature,
  TypeNode,
  TypeParameter,
} from "./types";

export type MemberKind = "constructor" | "property" | "method" | "accessor";

export interface MergedMember {
  name: string;
  kind: MemberKind;
  source?: Reflection;
  typings?: Reflection;
}

export interface MergedSignature {
  name: string;
  typeParameters?: TypeParameter[];
  parameters: Parameter[];
  returnType?: TypeNode;
  comment?: Comment;
}

export function frontmatter(data: {
  title: string;
  description: string;
  sourceUrl?: string;
}): string {
  const lines = [
    "---",
    `title: ${JSON.stringify(data.title)}`,
    `description: ${JSON.stringify(data.description)}`,
  ];
  if (data.sourceUrl) {
    lines.push(`sourceUrl: ${JSON.stringify(data.sourceUrl)}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function memberKind(kind: number): MemberKind | undefined {
  if (kind === Kind.Constructor) {
    return "constructor";
  }
  if (kind === Kind.Property) {
    return "property";
  }
  if (kind === Kind.Method) {
    return "method";
  }
  if (kind === Kind.Accessor) {
    return "accessor";
  }
  return undefined;
}

export function mergeMembers(
  source?: Reflection,
  typings?: Reflection
): MergedMember[] {
  const members = new Map<string, MergedMember>();

  for (const child of source?.children ?? []) {
    const kind = memberKind(child.kind);
    if (!kind) {
      continue;
    }
    members.set(child.name, { kind, name: child.name, source: child });
  }

  for (const child of typings?.children ?? []) {
    const kind = memberKind(child.kind);
    if (!kind) {
      continue;
    }

    const existing = members.get(child.name);
    if (existing) {
      existing.typings = child;
    } else {
      members.set(child.name, { kind, name: child.name, typings: child });
    }
  }

  return [...members.values()];
}

function mergeParameters(source?: Signature, typings?: Signature): Parameter[] {
  const byName = new Map<string, Parameter>();

  for (const parameter of source?.parameters ?? []) {
    byName.set(parameter.name, { ...parameter });
  }

  for (const parameter of typings?.parameters ?? []) {
    const existing = byName.get(parameter.name);
    byName.set(parameter.name, {
      ...existing,
      ...parameter,
      comment: existing?.comment ?? parameter.comment,
      type: parameter.type ?? existing?.type,
    });
  }

  const order = (source?.parameters ?? typings?.parameters ?? []).map(
    (parameter) => parameter.name
  );
  for (const parameter of typings?.parameters ?? []) {
    if (!order.includes(parameter.name)) {
      order.push(parameter.name);
    }
  }

  return order
    .map((name) => byName.get(name))
    .filter((parameter): parameter is Parameter => Boolean(parameter));
}

export function mergeSignature(
  source?: Signature,
  typings?: Signature
): MergedSignature {
  return {
    comment: source?.comment ?? typings?.comment,
    name: source?.name ?? typings?.name ?? "",
    parameters: mergeParameters(source, typings),
    returnType: typings?.type ?? source?.type,
    typeParameters: typings?.typeParameters ?? source?.typeParameters,
  };
}

export function signatureLine(
  signature: MergedSignature,
  name: string
): string {
  const typeParameters = renderTypeParameters(signature.typeParameters);
  const parameters = signature.parameters
    .map((parameter) => {
      const optional =
        parameter.flags?.isOptional || parameter.defaultValue !== undefined
          ? "?"
          : "";
      return `${parameter.name}${optional}: ${renderType(parameter.type)}`;
    })
    .join(", ");

  return `${name}${typeParameters}(${parameters}): ${renderType(signature.returnType)}`;
}

export function renderParameterList(parameters: Parameter[]): string {
  return parameters
    .map((parameter) => {
      const optional =
        parameter.flags?.isOptional || parameter.defaultValue !== undefined
          ? "?"
          : "";
      const description = plainText(parameter.comment?.summary);
      const code = inlineCode(
        `${parameter.name}${optional}: ${renderType(parameter.type)}`
      );
      return description
        ? `- ${code} — ${escapeMdx(description)}`
        : `- ${code}`;
    })
    .join("\n");
}

export function renderMemberBody(
  source: Reflection | undefined,
  typings: Reflection | undefined
): string {
  const sourceSignature = source?.signatures?.[0];
  const typingsSignature = typings?.signatures?.[0];

  if (sourceSignature || typingsSignature) {
    const merged = mergeSignature(sourceSignature, typingsSignature);
    const code = signatureLine(
      merged,
      source?.name ?? typings?.name ?? "method"
    );
    const description = renderSummary(merged.comment);
    const parameters = renderParameterList(merged.parameters);
    const returns = merged.returnType
      ? `**Returns:** ${inlineCode(renderType(merged.returnType))}`
      : "";

    return [description, "```ts", code, "```", parameters, returns]
      .filter(Boolean)
      .join("\n\n");
  }

  const propertyType = renderType(typings?.type ?? source?.type);
  const description = renderSummary(source?.comment ?? typings?.comment);
  return [description, `**Type:** ${inlineCode(propertyType)}`]
    .filter(Boolean)
    .join("\n\n");
}
