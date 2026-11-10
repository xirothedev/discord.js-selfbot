import type { Parameter, Signature, TypeNode, TypeParameter } from "./types";

const WRAPPED_TYPES = new Set([
  "union",
  "intersection",
  "conditional",
  "function",
]);

type Render = (node?: TypeNode) => string;

function isTypeNode(value: unknown): value is TypeNode {
  return typeof value === "object" && value !== null && "type" in value;
}

function wrap(node: TypeNode | undefined, render: Render): string {
  const rendered = render(node);
  return node && WRAPPED_TYPES.has(node.type) ? `(${rendered})` : rendered;
}

function renderReflectionType(node: TypeNode, render: Render): string {
  const children = node.declaration?.children;
  if (!children?.length) {
    return "unknown";
  }

  const fields = children
    .filter((child) => child.name !== "__call" && child.name !== "__construct")
    .map(
      (child) =>
        `${child.name}${child.flags?.isOptional ? "?" : ""}: ${render(child.type)}`
    );

  return fields.length ? `{ ${fields.join("; ")} }` : "unknown";
}

type Renderer = (node: TypeNode, render: Render) => string;

const RENDERERS: Partial<Record<string, Renderer>> = {
  array: (node, render) => `${wrap(node.elementType, render)}[]`,
  conditional: (node, render) =>
    `${render(node.checkType)} extends ${render(node.extendsType)} ? ${render(
      node.trueType
    )} : ${render(node.falseType)}`,
  indexedAccess: (node, render) =>
    `${render(node.objectType)}[${render(node.indexType)}]`,
  inferred: (node) => `infer ${node.name ?? "T"}`,
  intersection: (node, render) =>
    node.types?.map((type) => render(type)).join(" & ") ?? "unknown",
  intrinsic: (node) => node.name ?? "unknown",
  literal: (node) => {
    if (typeof node.value === "string") {
      return JSON.stringify(node.value);
    }
    if (node.value === null) {
      return "null";
    }
    return String(node.value ?? "unknown");
  },
  mapped: (node) =>
    node.name ? `{ [${node.name} in ...]: ... }` : "Record<string, unknown>",
  namedTupleMember: (node, render) =>
    `${node.name ?? "value"}: ${render(node.elementType)}`,
  optional: (node, render) => `${render(node.elementType)}?`,
  query: (node, render) => `typeof ${render(node.queryType)}`,
  reference: (node, render) => {
    const args = node.typeArguments?.length
      ? `<${node.typeArguments.map((argument) => render(argument)).join(", ")}>`
      : "";
    return `${node.name ?? "unknown"}${args}`;
  },
  reflection: (node, render) => renderReflectionType(node, render),
  rest: (node, render) => `...${render(node.elementType)}`,
  templateLiteral: () => `\`\${string}\``,
  tuple: (node, render) =>
    `[${(node.elements ?? []).map((element) => render(element)).join(", ")}]`,
  typeOperator: (node, render) =>
    `${node.operator ?? "keyof"} ${wrap(isTypeNode(node.target) ? node.target : undefined, render)}`,
  typeParameter: (node) => node.name ?? "T",
  union: (node, render) =>
    node.types?.map((type) => render(type)).join(" | ") ?? "unknown",
  unknown: () => "unknown",
};

export function renderType(node?: TypeNode): string {
  if (!node) {
    return "unknown";
  }
  const renderer = RENDERERS[node.type];
  return renderer ? renderer(node, renderType) : (node.name ?? "unknown");
}

export function renderTypeParameters(parameters?: TypeParameter[]): string {
  if (!parameters?.length) {
    return "";
  }

  const rendered = parameters.map((parameter) => {
    const constraint = parameter.type
      ? ` extends ${renderType(parameter.type)}`
      : "";
    const fallback = parameter.default
      ? ` = ${renderType(parameter.default)}`
      : "";
    return `${parameter.name}${constraint}${fallback}`;
  });

  return `<${rendered.join(", ")}>`;
}

export function renderParameter(parameter: Parameter): string {
  const optional =
    parameter.flags?.isOptional || parameter.defaultValue !== undefined
      ? "?"
      : "";
  return `${parameter.name}${optional}: ${renderType(parameter.type)}`;
}

export function renderSignature(signature: Signature, name?: string): string {
  const typeParameters = renderTypeParameters(signature.typeParameters);
  const parameters = (signature.parameters ?? [])
    .map((parameter) => renderParameter(parameter))
    .join(", ");
  return `${name ?? signature.name}${typeParameters}(${parameters}): ${renderType(signature.type)}`;
}

export function renderHeritage(
  extended: TypeNode[] | undefined,
  implemented: TypeNode[] | undefined
): string {
  const clauses: string[] = [];
  if (extended?.length) {
    clauses.push(
      `extends ${extended.map((type) => renderType(type)).join(", ")}`
    );
  }
  if (implemented?.length) {
    clauses.push(
      `implements ${implemented.map((type) => renderType(type)).join(", ")}`
    );
  }
  return clauses.join(" ");
}
