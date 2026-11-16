import type { Collection, JSCodeShift, NodePath } from 'jscodeshift';
import type { RuleContext } from './engine';

export interface AstNode {
  type: string;
  loc?: { start?: { line?: number } } | null;
  [key: string]: unknown;
}

// The linter treats any `.forEach`/`.find(type, filter)` call as an Array
// method by name, so every jscodeshift traversal goes through these helpers.
interface PathsCollection {
  __paths?: readonly NodePath<AstNode>[];
}
interface Findable {
  find?: (type: unknown, filter?: Record<string, unknown>) => unknown;
}

export function nodePaths(collection: unknown): NodePath<AstNode>[] {
  return [...((collection as PathsCollection | undefined)?.__paths ?? [])];
}

export function findBy(
  ctx: RuleContext,
  type: unknown,
  filter?: Record<string, unknown>
): NodePath<AstNode>[] {
  const found = (ctx.root as unknown as Findable).find?.call(
    ctx.root,
    type,
    filter
  );
  return nodePaths(found);
}

export function findIn(
  subject: unknown,
  type: unknown,
  filter?: Record<string, unknown>
): NodePath<AstNode>[] {
  const found = (subject as Findable | undefined)?.find?.call(
    subject,
    type,
    filter
  );
  return nodePaths(found);
}

export function where(
  paths: readonly NodePath<AstNode>[],
  predicate: (path: NodePath<AstNode>) => boolean
): NodePath<AstNode>[] {
  return paths.filter((path) => predicate(path));
}

export function nodeString(
  node: AstNode | null | undefined
): string | undefined {
  if (!node) {
    return undefined;
  }
  if (node.type === 'StringLiteral') {
    return node.value as string;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return undefined;
}

export function nodeNumber(
  node: AstNode | null | undefined
): string | undefined {
  if (!node) {
    return undefined;
  }
  if (node.type === 'NumericLiteral') {
    return String(node.value);
  }
  if (node.type === 'Literal' && typeof node.value === 'number') {
    return String(node.value);
  }
  return undefined;
}

export function isCallTo(
  callee: AstNode | null | undefined,
  name: string
): boolean {
  return Boolean(
    callee && callee.type === 'Identifier' && callee.name === name
  );
}

// recast's babel parser emits ESTree-style `Property` nodes while the TS parser
// emits babel `ObjectProperty`; every rule must accept both.
export function isObjectProperty(node: AstNode | null | undefined): boolean {
  return node?.type === 'ObjectProperty' || node?.type === 'Property';
}

// ponytail: identifier renames have no scope analysis; we verify the binding
// through ast-types' path.scope when available and fall back to file-wide
// matching. Upgrade path: adopt scope-true renames if false positives appear.
export function renameIdentifier(
  ctx: RuleContext,
  from: string,
  to: string
): void {
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.Identifier, {
    name: from,
  })) {
    const parent = path.parent?.node as AstNode | undefined;
    if (parent && isObjectProperty(parent) && parent.value !== path.node) {
      continue;
    }
    if (
      parent &&
      parent.type === 'MemberExpression' &&
      !parent.computed &&
      parent.property === path.node
    ) {
      continue;
    }
    const { scope } = path as unknown as {
      scope?: { lookup: (name: string) => unknown };
    };
    if (scope) {
      const binding = scope.lookup(from);
      const declaration = (binding as { value?: AstNode } | null | undefined)
        ?.value;
      if (declaration?.type === 'ClassDeclaration') {
        continue;
      }
    }
    path.node.name = to;
    ctx.count(`rename:${from}->${to}`);
  }
}

function programBody(ast: JSCodeShift, root: Collection): AstNode[] {
  let body: AstNode[] | undefined;
  for (const path of findIn(root, ast.types.namedTypes.Program)) {
    body = (path.node.body ?? []) as AstNode[];
  }
  if (!body) {
    throw new Error('expected a Program body');
  }
  return body;
}

function replaceProgramBody(
  ast: JSCodeShift,
  root: Collection,
  body: readonly AstNode[]
): void {
  for (const path of findIn(root, ast.types.namedTypes.Program)) {
    const bodyPath = (
      path as unknown as {
        get: (name: string) => { replace: (value: unknown) => void };
      }
    ).get('body');
    bodyPath.replace([...body]);
  }
}

export function makeStringLiteral(ast: JSCodeShift, value: string): AstNode {
  return ast.types.builders.stringLiteral(value) as unknown as AstNode;
}

export function rewriteStringNode(node: AstNode, value: string): void {
  node.value = value;
  if ('raw' in node) {
    node.raw = `'${value.replaceAll("'", String.raw`\'`)}'`;
  }
  (node as { original?: unknown }).original = null;
}

function hasEsImports(ctx: RuleContext): boolean {
  return findBy(ctx, ctx.ast.types.namedTypes.ImportDeclaration).length > 0;
}

export function ensureNamedImport(
  ctx: RuleContext,
  from: string,
  name: string,
  typeOnly = false
): void {
  const { ast, root } = ctx;
  if (hasEsImports(ctx)) {
    const matching = where(
      findBy(ctx, ast.types.namedTypes.ImportDeclaration),
      (path) => nodeString(path.node.source as AstNode) === from
    );
    // Type-only imports always get their own declaration: setting importKind on
    // an existing declaration would turn value imports (Client!) into types.
    const declarations = matching.filter((path) =>
      typeOnly
        ? path.node.importKind === 'type'
        : path.node.importKind !== 'type'
    );
    if (declarations.length > 0) {
      for (const path of declarations) {
        const specifiers = (path.node.specifiers ?? []) as AstNode[];
        const already = specifiers.some(
          (specifier) =>
            (specifier as { imported?: { name?: string } }).imported?.name ===
            name
        );
        if (already) {
          continue;
        }
        const extended = [
          ...specifiers,
          ast.types.builders.importSpecifier(
            ast.types.builders.identifier(name),
            ast.types.builders.identifier(name)
          ) as unknown as AstNode,
        ];
        (
          path as unknown as {
            get: (name: string) => { replace: (value: unknown) => void };
          }
        )
          .get('specifiers')
          .replace(extended);
      }
      return;
    }
    const declaration = ast.types.builders.importDeclaration(
      [
        ast.types.builders.importSpecifier(
          ast.types.builders.identifier(name),
          ast.types.builders.identifier(name)
        ),
      ] as never,
      makeStringLiteral(ast, from) as never
    ) as unknown as AstNode;
    declaration.importKind = typeOnly ? 'type' : 'value';
    const body = programBody(ast, root);
    const insertAt = typeOnly
      ? Math.max(
          body.findIndex((entry) => entry.type === 'ImportDeclaration'),
          0
        )
      : 0;
    const next = [...body];
    next.splice(insertAt, 0, declaration);
    replaceProgramBody(ast, root, next);
    return;
  }
  const call = ast.types.builders.callExpression(
    ast.types.builders.identifier('require'),
    [makeStringLiteral(ast, from) as never]
  );
  const property = ast.types.builders.objectProperty(
    ast.types.builders.identifier(name),
    ast.types.builders.identifier(name),
    false,
    true
  );
  const pattern = ast.types.builders.objectPattern([
    property as never,
  ]) as unknown as AstNode;
  const declarator = ast.types.builders.variableDeclarator(
    pattern as never,
    call as never
  ) as unknown as AstNode;
  const statement = ast.types.builders.variableDeclaration('const', [
    declarator as never,
  ]) as unknown as AstNode;
  const body = programBody(ast, root);
  replaceProgramBody(ast, root, [statement, ...body]);
}

export function prependMarkerComment(
  ctx: RuleContext,
  statement: AstNode,
  ruleId: string,
  markerText: string
): boolean {
  const comments = (statement.comments ??= []) as {
    type?: string;
    leading?: boolean;
    value?: string;
  }[];
  if (
    comments.some(
      (comment) =>
        comment.leading && comment.value?.includes(`TODO(codemod:${ruleId})`)
    )
  ) {
    return false;
  }
  ctx.count(`marker:${ruleId}`);
  comments.unshift({
    leading: true,
    type: 'CommentLine',
    value: ` ${markerText}`,
  });
  (statement as { original?: unknown }).original = null;
  return true;
}

export function enclosingStatement(path: unknown): AstNode {
  let current = path as { node: AstNode; parent?: unknown };
  while (current.parent) {
    const parent = current.parent as { node: AstNode; parent?: unknown };
    if (
      parent.node.type.endsWith('Statement') &&
      parent.node.type !== 'BlockStatement'
    ) {
      return parent.node;
    }
    current = parent;
  }
  return current.node;
}

export function findObjectProperties(ctx: RuleContext): NodePath<AstNode>[] {
  const property = findBy(ctx, ctx.ast.types.namedTypes.Property);
  const objectProperty = findBy(ctx, ctx.ast.types.namedTypes.ObjectProperty);
  return [...property, ...objectProperty];
}
