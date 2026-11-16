import type { Rule, RuleContext } from '../engine';
import {
  ensureNamedImport,
  findBy,
  findObjectProperties,
  nodeString,
} from '../ast';
import type { AstNode } from '../ast';
import { parserForPath } from '../engine';
import { TARGET_PACKAGE, partialsCastRule } from '../rename-map';

function isPartialsEnumElement(node: AstNode): boolean {
  return (
    node.type === 'MemberExpression' &&
    !node.computed &&
    (node.object as AstNode).type === 'Identifier' &&
    (node.object as AstNode).name === partialsCastRule.enumImport
  );
}

function hasPartialsImport(ctx: RuleContext): boolean {
  return findBy(ctx, ctx.ast.types.namedTypes.ImportSpecifier).some((path) => {
    const source = nodeString(
      (path.parent?.node as AstNode | undefined)?.source as AstNode
    );
    return (
      source === TARGET_PACKAGE &&
      (path.node.imported as AstNode | undefined)?.name ===
        partialsCastRule.enumImport
    );
  });
}

function wrapPartialsCast(ctx: RuleContext): boolean {
  let changed = false;
  for (const path of findObjectProperties(ctx)) {
    const key = path.node.key as AstNode;
    if (key.type !== 'Identifier' || key.name !== 'partials') {
      continue;
    }
    const value = path.node.value as AstNode;
    if (value.type !== 'ArrayExpression') {
      continue;
    }
    const elements = (value.elements ?? []) as AstNode[];
    if (elements.length === 0 || !elements.every(isPartialsEnumElement)) {
      continue;
    }
    const unknownAs = { type: 'TSUnknownKeyword' } as unknown as AstNode;
    const typedArray = {
      elementType: {
        type: 'TSTypeReference',
        typeName: { name: partialsCastRule.typeImport, type: 'Identifier' },
      },
      type: 'TSArrayType',
    } as unknown as AstNode;
    const cast = ctx.ast.types.builders.tsAsExpression(
      ctx.ast.types.builders.tsAsExpression(
        value as never,
        unknownAs as never
      ) as never,
      typedArray as never
    ) as unknown as AstNode;
    (
      path as unknown as {
        get: (name: string) => { replace: (value: unknown) => void };
      }
    )
      .get('value')
      .replace(cast);
    ensureNamedImport(ctx, TARGET_PACKAGE, partialsCastRule.typeImport, true);
    ctx.count('partials-cast');
    changed = true;
  }
  return changed;
}

export const partialsCastRuleModule: Rule = {
  apply: (ctx) =>
    parserForPath(ctx.fileInfo.path) !== 'babel' && hasPartialsImport(ctx)
      ? wrapPartialsCast(ctx)
      : false,
  description:
    'Insert the documented `as unknown as PartialTypes[]` cast on numeric Partials arrays',
  id: 'partials-cast',
  tier: 'breaking',
};
