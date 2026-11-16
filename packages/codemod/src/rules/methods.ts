import type { Rule, RuleContext } from '../engine';
import { findBy, findObjectProperties } from '../ast';
import type { AstNode } from '../ast';
import {
  heuristicMemberRenames,
  methodRenames,
  optionKeyRenames,
} from '../rename-map';

interface RenamePair {
  readonly from: string;
  readonly to: string;
  readonly guard?: (name: string) => boolean;
}

function rootIdentifierName(node: AstNode): string | undefined {
  let current = node;
  while (current.type === 'MemberExpression') {
    current = current.object as AstNode;
  }
  return current.type === 'Identifier' && typeof current.name === 'string'
    ? current.name
    : undefined;
}

function renameMembers(
  ctx: RuleContext,
  pairs: readonly RenamePair[]
): boolean {
  let changed = false;
  for (const { from, to, guard } of pairs) {
    for (const path of findBy(ctx, ctx.ast.types.namedTypes.MemberExpression)) {
      if (path.node.computed) {
        continue;
      }
      const property = path.node.property as AstNode;
      if (property.type !== 'Identifier' || property.name !== from) {
        continue;
      }
      if (
        guard &&
        !guard(rootIdentifierName(path.node.object as AstNode) ?? '')
      ) {
        continue;
      }
      property.name = to;
      ctx.count(`member-rename:${from}->${to}`);
      changed = true;
    }
  }
  return changed;
}

function renameOptionKeys(ctx: RuleContext): boolean {
  let changed = false;
  for (const { from, to } of optionKeyRenames) {
    for (const path of findObjectProperties(ctx)) {
      const key = path.node.key as AstNode;
      if (key.type !== 'Identifier' || key.name !== from) {
        continue;
      }
      key.name = to;
      ctx.count(`option-key:${from}->${to}`);
      changed = true;
    }
  }
  return changed;
}

const methodRenamePairs: readonly RenamePair[] = methodRenames.map(
  ({ from, to }) => ({ from, to })
);
const heuristicPairs: readonly RenamePair[] = heuristicMemberRenames.map(
  ({ from, receiverHint, to }) => ({
    from,
    guard: (name: string) => name.toLowerCase().includes(receiverHint),
    to,
  })
);

export const methodRenamesRule: Rule = {
  apply: (ctx) =>
    renameMembers(ctx, methodRenamePairs) || renameMembers(ctx, heuristicPairs),
  description: 'Rename renamed and aliased methods to their v14 names',
  id: 'method-renames',
  tier: 'modernize',
};

export const optionKeysRule: Rule = {
  apply: renameOptionKeys,
  description:
    'Rename changed interaction response option keys (fetchReply -> withResponse)',
  id: 'option-key-renames',
  tier: 'modernize',
};
