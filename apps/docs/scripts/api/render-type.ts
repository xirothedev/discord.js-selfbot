import type { Parameter, Signature, TypeNode, TypeParameter } from './types';

function isTypeNode(value: unknown): value is TypeNode {
  return typeof value === 'object' && value !== null && 'type' in value;
}

function wrap(node: TypeNode | undefined): string {
  const rendered = renderType(node);
  return node && ['union', 'intersection', 'conditional', 'function'].includes(node.type) ? `(${rendered})` : rendered;
}

export function renderType(node?: TypeNode): string {
  if (!node) return 'unknown';

  switch (node.type) {
    case 'intrinsic':
      return node.name ?? 'unknown';
    case 'reference': {
      const args = node.typeArguments?.length
        ? `<${node.typeArguments.map(argument => renderType(argument)).join(', ')}>`
        : '';
      return `${node.name ?? 'unknown'}${args}`;
    }
    case 'array':
      return `${wrap(node.elementType)}[]`;
    case 'union':
      return node.types?.map(type => renderType(type)).join(' | ') ?? 'unknown';
    case 'intersection':
      return node.types?.map(type => renderType(type)).join(' & ') ?? 'unknown';
    case 'literal':
      if (typeof node.value === 'string') return JSON.stringify(node.value);
      if (node.value === null) return 'null';
      return String(node.value ?? 'unknown');
    case 'tuple':
      return `[${(node.elements ?? []).map(element => renderType(element)).join(', ')}]`;
    case 'reflection':
      return renderReflectionType(node);
    case 'typeOperator':
      return `${node.operator ?? 'keyof'} ${wrap(isTypeNode(node.target) ? node.target : undefined)}`;
    case 'indexedAccess':
      return `${renderType(node.objectType)}[${renderType(node.indexType)}]`;
    case 'query':
      return `typeof ${renderType(node.queryType)}`;
    case 'conditional':
      return `${renderType(node.checkType)} extends ${renderType(node.extendsType)} ? ${renderType(
        node.trueType,
      )} : ${renderType(node.falseType)}`;
    case 'mapped':
      return node.name ? `{ [${node.name} in ...]: ... }` : 'Record<string, unknown>';
    case 'templateLiteral':
      return '`${string}`';
    case 'optional':
      return `${renderType(node.elementType)}?`;
    case 'rest':
      return `...${renderType(node.elementType)}`;
    case 'namedTupleMember':
      return `${node.name ?? 'value'}: ${renderType(node.elementType)}`;
    case 'inferred':
      return `infer ${node.name ?? 'T'}`;
    case 'typeParameter':
      return node.name ?? 'T';
    case 'unknown':
      return 'unknown';
    default:
      return node.name ?? 'unknown';
  }
}

function renderReflectionType(node: TypeNode): string {
  const children = node.declaration?.children;
  if (!children?.length) return 'unknown';

  const fields = children
    .filter(child => child.name !== '__call' && child.name !== '__construct')
    .map(child => `${child.name}${child.flags?.isOptional ? '?' : ''}: ${renderType(child.type)}`);

  return fields.length ? `{ ${fields.join('; ')} }` : 'unknown';
}

export function renderTypeParameters(parameters?: TypeParameter[]): string {
  if (!parameters?.length) return '';

  const rendered = parameters.map(parameter => {
    const constraint = parameter.type ? ` extends ${renderType(parameter.type)}` : '';
    const fallback = parameter.default ? ` = ${renderType(parameter.default)}` : '';
    return `${parameter.name}${constraint}${fallback}`;
  });

  return `<${rendered.join(', ')}>`;
}

export function renderParameter(parameter: Parameter): string {
  const optional = parameter.flags?.isOptional || parameter.defaultValue !== undefined ? '?' : '';
  return `${parameter.name}${optional}: ${renderType(parameter.type)}`;
}

export function renderSignature(signature: Signature, name?: string): string {
  const typeParameters = renderTypeParameters(signature.typeParameters);
  const parameters = (signature.parameters ?? []).map(parameter => renderParameter(parameter)).join(', ');
  return `${name ?? signature.name}${typeParameters}(${parameters}): ${renderType(signature.type)}`;
}

export function renderHeritage(extended: TypeNode[] | undefined, implemented: TypeNode[] | undefined): string {
  const clauses: string[] = [];
  if (extended?.length) clauses.push(`extends ${extended.map(type => renderType(type)).join(', ')}`);
  if (implemented?.length) clauses.push(`implements ${implemented.map(type => renderType(type)).join(', ')}`);
  return clauses.join(' ');
}
