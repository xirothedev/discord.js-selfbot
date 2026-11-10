import {
  escapeMdx,
  frontmatterDescription,
  inlineCode,
  renderDeprecated,
  renderExamples,
  renderSummary,
  stripJsdocSyntax,
} from "./comment";
import {
  frontmatter,
  mergeMembers,
  mergeSignature,
  renderParameterList,
  signatureLine,
} from "./render-shared";
import type { MergedMember } from "./render-shared";
import {
  renderType,
  renderHeritage,
  renderTypeParameters,
} from "./render-type";
import type { DocgenEvent, Reflection } from "./types";

export interface ClassPageInput {
  name: string;
  source?: Reflection;
  typings?: Reflection;
  sourceUrl?: string;
  events?: DocgenEvent[];
  privateMembers?: string[];
}

const INHERITED_MEMBERS = new Set([
  "[captureRejectionSymbol]",
  "addAbortListener",
  "addListener",
  "captureRejectionSymbol",
  "captureRejections",
  "defaultMaxListeners",
  "emit",
  "errorMonitor",
  "eventNames",
  "getEventListeners",
  "getMaxListeners",
  "listenerCount",
  "listeners",
  "off",
  "on",
  "once",
  "prependListener",
  "prependOnceListener",
  "rawListeners",
  "removeAllListeners",
  "removeListener",
  "setMaxListeners",
  "authenticator",
  "token",
]);

function renderMethod(member: MergedMember): string {
  const sourceSignatures = member.source?.signatures ?? [];
  const typingsSignatures = member.typings?.signatures ?? [];
  const count = Math.max(sourceSignatures.length, typingsSignatures.length);
  const parts: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const merged = mergeSignature(
      sourceSignatures[index],
      typingsSignatures[index]
    );
    const staticPrefix =
      member.typings?.flags?.isStatic || member.source?.flags?.isStatic
        ? "static "
        : "";
    const code = signatureLine(merged, `${staticPrefix}${member.name}`);
    const description = renderSummary(merged.comment);
    const parameters = renderParameterList(merged.parameters);
    const returns = merged.returnType
      ? `**Returns:** ${inlineCode(renderType(merged.returnType))}`
      : "";
    const examples = renderExamples(merged.comment);

    parts.push(
      [description, "```ts", code, "```", parameters, returns, examples]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  return parts.join("\n\n");
}

function renderEvent(event: DocgenEvent): string {
  const description = event.description
    ? escapeMdx(stripJsdocSyntax(event.description))
    : "";
  const params = (event.params ?? [])
    .map((parameter) => {
      const optional = parameter.optional ? "?" : "";
      const details = parameter.description
        ? ` — ${escapeMdx(stripJsdocSyntax(parameter.description))}`
        : "";
      return `- ${inlineCode(`${parameter.name}${optional}`)}${details}`;
    })
    .join("\n");

  return `### \`${event.name}\`\n\n${[description, params].filter(Boolean).join("\n\n")}`;
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
    flags.push("readonly");
  }
  if (typingsFlags?.isStatic || sourceFlags?.isStatic) {
    flags.push("static");
  }
  return flags;
}

function renderProperty(member: MergedMember): string {
  const description = renderSummary(
    member.source?.comment ?? member.typings?.comment
  );
  const flags = memberFlags(member);

  const meta = [
    `**Type:** ${inlineCode(renderType(propertyType(member)))}`,
    flags.length ? `**Modifiers:** ${flags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return [description, meta].filter(Boolean).join("\n\n");
}

function sortByName(members: MergedMember[]): MergedMember[] {
  return members.toSorted((left, right) => left.name.localeCompare(right.name));
}

function constructorSection(
  constructor: MergedMember | undefined,
  name: string
): string {
  if (!constructor) {
    return "";
  }
  const sourceSignature = constructor.source?.signatures?.[0];
  const typingsSignature = constructor.typings?.signatures?.[0];
  const merged = mergeSignature(sourceSignature, typingsSignature);
  const code = signatureLine(merged, `new ${name}`);
  const constructorDescription = renderSummary(merged.comment);
  const parameters = renderParameterList(merged.parameters);
  return [
    "## Constructor",
    constructorDescription,
    "```ts",
    code,
    "```",
    parameters,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function propertySection(members: MergedMember[]): string {
  const properties = sortByName(
    members.filter(
      (member) => member.kind === "property" || member.kind === "accessor"
    )
  );
  if (!properties.length) {
    return "";
  }
  return [
    "## Properties",
    ...properties.map(
      (property) => `### \`${property.name}\`\n\n${renderProperty(property)}`
    ),
  ].join("\n\n");
}

function methodSection(members: MergedMember[]): string {
  const methods = sortByName(
    members.filter((member) => member.kind === "method")
  );
  if (!methods.length) {
    return "";
  }
  return [
    "## Methods",
    ...methods.map(
      (method) => `### \`${method.name}\`\n\n${renderMethod(method)}`
    ),
  ].join("\n\n");
}

function eventSection(events: DocgenEvent[] | undefined): string {
  const sorted = [...(events ?? [])].toSorted((left, right) =>
    left.name.localeCompare(right.name)
  );
  if (!sorted.length) {
    return "";
  }
  return ["## Events", ...sorted.map((event) => renderEvent(event))].join(
    "\n\n"
  );
}

function classDeclaration(input: ClassPageInput): string {
  const { name, source, typings } = input;
  const typeParameters = source?.typeParameters ?? typings?.typeParameters;
  const heritage = renderHeritage(
    source?.extendedTypes ?? typings?.extendedTypes,
    source?.implementedTypes ?? typings?.implementedTypes
  );
  const prefix =
    source?.flags?.isAbstract || typings?.flags?.isAbstract ? "abstract " : "";
  return `${prefix}class ${name}${renderTypeParameters(typeParameters)}${heritage ? ` ${heritage}` : ""}`;
}

export function renderClassPage(input: ClassPageInput): string {
  const { name, source, typings } = input;
  const description = source?.comment ?? typings?.comment;
  const classLine = classDeclaration(input);

  const hidden = new Set([
    ...INHERITED_MEMBERS,
    ...(input.privateMembers ?? []),
  ]);
  const members = mergeMembers(source, typings).filter(
    (member) => !member.name.startsWith("_") && !hidden.has(member.name)
  );

  const sections = [
    constructorSection(
      members.find((member) => member.kind === "constructor"),
      name
    ),
    propertySection(members),
    methodSection(members),
    eventSection(input.events),
  ];

  return [
    frontmatter({
      description: frontmatterDescription(
        description,
        `${name} API reference.`
      ),
      sourceUrl: input.sourceUrl,
      title: name,
    }),
    "{/* This file is generated by apps/docs/scripts/generate-api.ts. Do not edit. */}",
    "",
    input.sourceUrl
      ? `<Callout type="info" title="Source">[View source](${input.sourceUrl})</Callout>`
      : "",
    renderDeprecated(description),
    renderSummary(description),
    "```ts",
    classLine,
    "```",
    ...sections,
  ]
    .filter(Boolean)
    .join("\n\n");
}
