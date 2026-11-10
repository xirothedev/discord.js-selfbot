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

function renderProperty(member: MergedMember): string {
  const type =
    member.typings?.type ??
    member.source?.type ??
    member.source?.getSignature?.type;
  const description = renderSummary(
    member.source?.comment ?? member.typings?.comment
  );
  const flags: string[] = [];
  if (member.typings?.flags?.isReadonly || member.source?.flags?.isReadonly) {
    flags.push("readonly");
  }
  if (member.typings?.flags?.isStatic || member.source?.flags?.isStatic) {
    flags.push("static");
  }

  const meta = [
    `**Type:** ${inlineCode(renderType(type))}`,
    flags.length ? `**Modifiers:** ${flags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return [description, meta].filter(Boolean).join("\n\n");
}

export function renderClassPage(input: ClassPageInput): string {
  const { name, source, typings } = input;
  const description = source?.comment ?? typings?.comment;
  const typeParameters = source?.typeParameters ?? typings?.typeParameters;
  const heritage = renderHeritage(
    source?.extendedTypes ?? typings?.extendedTypes,
    source?.implementedTypes ?? typings?.implementedTypes
  );
  const classLine = `${source?.flags?.isAbstract || typings?.flags?.isAbstract ? "abstract " : ""}class ${name}${renderTypeParameters(
    typeParameters
  )}${heritage ? ` ${heritage}` : ""}`;

  const hidden = new Set([
    ...INHERITED_MEMBERS,
    ...(input.privateMembers ?? []),
  ]);
  const members = mergeMembers(source, typings).filter(
    (member) => !member.name.startsWith("_") && !hidden.has(member.name)
  );
  const constructor = members.find((member) => member.kind === "constructor");
  const properties = members
    .filter(
      (member) => member.kind === "property" || member.kind === "accessor"
    )
    .toSorted((a, b) => a.name.localeCompare(b.name));
  const methods = members
    .filter((member) => member.kind === "method")
    .toSorted((a, b) => a.name.localeCompare(b.name));

  const sections: string[] = [];

  if (constructor) {
    const sourceSignature = constructor.source?.signatures?.[0];
    const typingsSignature = constructor.typings?.signatures?.[0];
    const merged = mergeSignature(sourceSignature, typingsSignature);
    const code = signatureLine(merged, `new ${name}`);
    const constructorDescription = renderSummary(merged.comment);
    const parameters = renderParameterList(merged.parameters);
    sections.push(
      [
        "## Constructor",
        constructorDescription,
        "```ts",
        code,
        "```",
        parameters,
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  if (properties.length) {
    sections.push(
      [
        "## Properties",
        ...properties.map(
          (property) =>
            `### \`${property.name}\`\n\n${renderProperty(property)}`
        ),
      ].join("\n\n")
    );
  }

  if (methods.length) {
    sections.push(
      [
        "## Methods",
        ...methods.map(
          (method) => `### \`${method.name}\`\n\n${renderMethod(method)}`
        ),
      ].join("\n\n")
    );
  }

  const events = [...(input.events ?? [])].toSorted((a, b) =>
    a.name.localeCompare(b.name)
  );
  if (events.length) {
    sections.push(
      ["## Events", ...events.map((event) => renderEvent(event))].join("\n\n")
    );
  }

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
