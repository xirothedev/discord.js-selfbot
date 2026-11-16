import type { Rule, RuleContext } from '../engine';
import { findBy, findIn, isObjectProperty, makeStringLiteral } from '../ast';
import type { AstNode } from '../ast';

// Q28 contract: converts CJS require statements to ESM imports and relies on
// the CLI to set `"type": "module"` in the user's package.json. Files that
// assign module.exports/exports.* are skipped — dual-format files stay CJS.

function usesExportsExports(ctx: RuleContext): boolean {
  const idents = findBy(ctx, ctx.ast.types.namedTypes.Identifier, {
    name: 'exports',
  }).length;
  const moduleRefs = findBy(ctx, ctx.ast.types.namedTypes.Identifier, {
    name: 'module',
  }).length;
  return idents > 0 && moduleRefs > 0;
}

function replaceStatement(
  ctx: RuleContext,
  statementNode: AstNode,
  declaration: AstNode
): void {
  for (const programPath of findIn(
    ctx.root,
    ctx.ast.types.namedTypes.Program
  )) {
    const body = (programPath.node.body ?? []) as AstNode[];
    (
      programPath as unknown as {
        get: (name: string) => { replace: (value: unknown) => void };
      }
    )
      .get('body')
      .replace(
        body.map((entry) => (entry === statementNode ? declaration : entry))
      );
  }
}

function buildImport(
  ctx: RuleContext,
  from: string,
  id: AstNode
): AstNode | undefined {
  const { builders } = ctx.ast.types;
  if (id.type === 'ObjectPattern') {
    const specifiers = ((id.properties ?? []) as AstNode[]).flatMap(
      (property) => {
        if (!isObjectProperty(property)) {
          return [];
        }
        const key = property.key as AstNode;
        const value = property.value as AstNode;
        if (key.type !== 'Identifier' || value.type !== 'Identifier') {
          return [];
        }
        return [
          builders.importSpecifier(
            builders.identifier(String(key.name)),
            builders.identifier(String(value.name))
          ),
        ];
      }
    );
    if (specifiers.length === 0) {
      return undefined;
    }
    return builders.importDeclaration(
      specifiers as never,
      makeStringLiteral(ctx.ast, from) as never
    ) as unknown as AstNode;
  }
  if (id.type === 'Identifier') {
    return builders.importDeclaration(
      [
        builders.importNamespaceSpecifier(builders.identifier(String(id.name))),
      ] as never,
      makeStringLiteral(ctx.ast, from) as never
    ) as unknown as AstNode;
  }
  return undefined;
}

function convertRequires(ctx: RuleContext): boolean {
  if (usesExportsExports(ctx)) {
    return false;
  }
  let changed = false;

  for (const path of findBy(ctx, ctx.ast.types.namedTypes.VariableDeclarator)) {
    const init = path.node.init as AstNode | null;
    if (!init || init.type !== 'CallExpression') {
      continue;
    }
    const callee = init.callee as AstNode;
    if (!callee || callee.type !== 'Identifier' || callee.name !== 'require') {
      continue;
    }
    const [arg] = init.arguments as AstNode[];
    if (
      !arg ||
      (arg.type !== 'StringLiteral' &&
        !(arg.type === 'Literal' && typeof arg.value === 'string'))
    ) {
      continue;
    }
    const from = String(arg.value);
    const statementPath = path.parent;
    const statementNode = statementPath?.node as AstNode | undefined;
    if (!statementNode || statementNode.type !== 'VariableDeclaration') {
      continue;
    }
    if (((statementNode.declarations ?? []) as AstNode[]).length !== 1) {
      continue;
    }
    const declaration = buildImport(ctx, from, path.node.id as AstNode);
    if (!declaration) {
      continue;
    }
    replaceStatement(ctx, statementNode, declaration);
    ctx.count('cjs-to-esm');
    changed = true;
  }

  return changed;
}

export const esmConversionRule: Rule = {
  apply: convertRequires,
  description:
    'Convert require statements to ESM imports (with --esm; sets "type": "module")',
  id: 'cjs-to-esm',
  tier: 'modernize',
};
