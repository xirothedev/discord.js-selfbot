import type { Rule, RuleContext } from '../engine';
import { ensureNamedImport, findBy, nodeNumber, nodeString } from '../ast';
import type { AstNode } from '../ast';
import {
  BUTTON_STYLE_IMPORT,
  SET_STYLE_METHOD,
  buttonStyleMap,
} from '../rename-map';

function rewriteSetStyle(ctx: RuleContext): boolean {
  let changed = false;

  for (const path of findBy(ctx, ctx.ast.types.namedTypes.CallExpression)) {
    const callee = path.node.callee as AstNode;
    if (!callee || callee.type !== 'MemberExpression' || callee.computed) {
      continue;
    }
    const property = callee.property as AstNode;
    if (property.type !== 'Identifier' || property.name !== SET_STYLE_METHOD) {
      continue;
    }
    const [first] = (path.node.arguments ?? []) as AstNode[];
    const raw = nodeString(first) ?? nodeNumber(first);
    if (!raw) {
      continue;
    }
    const style = buttonStyleMap[raw];
    if (!style) {
      continue;
    }
    const replacement = {
      computed: false,
      object: ctx.ast.types.builders.identifier(
        BUTTON_STYLE_IMPORT.name
      ) as unknown as AstNode,
      property: ctx.ast.types.builders.identifier(style) as unknown as AstNode,
      type: 'MemberExpression',
    } as AstNode;
    (
      path as unknown as {
        get: (
          name: string,
          index: number
        ) => { replace: (value: unknown) => void };
      }
    )
      .get('arguments', 0)
      .replace(replacement);
    ensureNamedImport(ctx, BUTTON_STYLE_IMPORT.from, BUTTON_STYLE_IMPORT.name);
    ctx.count('button-style');
    changed = true;
  }

  return changed;
}

export const buttonStyleRule: Rule = {
  apply: rewriteSetStyle,
  description:
    'Rewrite setStyle strings/numbers to ButtonStyle enum from discord-api-types/v10',
  id: 'button-style',
  tier: 'modernize',
};
