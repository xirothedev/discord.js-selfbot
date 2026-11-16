import type { Rule, RuleContext } from '../engine';
import {
  enclosingStatement,
  findBy,
  isObjectProperty,
  nodeString,
  prependMarkerComment,
} from '../ast';
import type { AstNode } from '../ast';
import {
  SOURCE_PACKAGE,
  TARGET_PACKAGE,
  awaitDestroyRule,
  destructuredDeprecatedOptions,
  markerExports,
  markerMethods,
  migrationMarker,
} from '../rename-map';
import type { MarkerRule } from '../rename-map';

const packageSources = (): Set<string> =>
  new Set([SOURCE_PACKAGE, TARGET_PACKAGE]);

function rootIdentifierName(node: AstNode): string | undefined {
  let current = node;
  while (current.type === 'MemberExpression') {
    current = current.object as AstNode;
  }
  return current.type === 'Identifier' && typeof current.name === 'string'
    ? current.name
    : undefined;
}

function annotate(
  ctx: RuleContext,
  path: unknown,
  node: AstNode,
  rule: MarkerRule
): void {
  if (
    prependMarkerComment(
      ctx,
      enclosingStatement(path),
      rule.id,
      migrationMarker(rule.id, rule.message, rule.anchor)
    )
  ) {
    ctx.mark(node, rule.id, rule.message, rule.anchor);
  }
}

function markerMethodsRule(ctx: RuleContext): void {
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.CallExpression)) {
    const callee = path.node.callee as AstNode;
    if (!callee || callee.type !== 'MemberExpression' || callee.computed) {
      continue;
    }
    const property = callee.property as AstNode;
    if (property.type !== 'Identifier' || typeof property.name !== 'string') {
      continue;
    }
    const receiver = rootIdentifierName(callee.object as AstNode);
    for (const rule of markerMethods) {
      const hintOk =
        !rule.receiverHint ||
        (receiver ?? '').toLowerCase().includes(rule.receiverHint);
      if (!hintOk || !rule.names.includes(property.name)) {
        continue;
      }
      annotate(ctx, path, path.node, rule);
    }
  }
}

function markerExportsRule(ctx: RuleContext): void {
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.ImportDeclaration)) {
    const source = nodeString(path.node.source as AstNode);
    if (!source || !packageSources().has(source)) {
      continue;
    }
    for (const specifier of (path.node.specifiers ?? []) as AstNode[]) {
      if (specifier.type !== 'ImportSpecifier') {
        continue;
      }
      const name = (specifier.imported as AstNode)?.name;
      if (typeof name !== 'string') {
        continue;
      }
      for (const rule of markerExports) {
        if (!rule.names.includes(name)) {
          continue;
        }
        annotate(ctx, path, path.node, rule);
      }
    }
  }
}

function awaitDestroyRuleImpl(ctx: RuleContext): void {
  const rule: MarkerRule = {
    anchor: awaitDestroyRule.anchor,
    id: awaitDestroyRule.id,
    message: awaitDestroyRule.message,
    names: [awaitDestroyRule.method],
  };
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.AwaitExpression)) {
    const argument = path.node.argument as AstNode;
    if (!argument || argument.type !== 'CallExpression') {
      continue;
    }
    const callee = argument.callee as AstNode;
    if (!callee || callee.type !== 'MemberExpression' || callee.computed) {
      continue;
    }
    const property = callee.property as AstNode;
    if (
      property.type !== 'Identifier' ||
      property.name !== awaitDestroyRule.method
    ) {
      continue;
    }
    annotate(ctx, path, path.node, rule);
  }
}

function deprecatedClientOptionsRule(ctx: RuleContext): void {
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.NewExpression)) {
    const callee = path.node.callee as AstNode;
    if (callee.type !== 'Identifier' || callee.name !== 'Client') {
      continue;
    }
    const [first] = (path.node.arguments ?? []) as AstNode[];
    if (!first || first.type !== 'ObjectExpression') {
      continue;
    }
    for (const property of (first.properties ?? []) as AstNode[]) {
      if (!isObjectProperty(property)) {
        continue;
      }
      const key = property.key as AstNode;
      if (key.type !== 'Identifier' || typeof key.name !== 'string') {
        continue;
      }
      const replacement = destructuredDeprecatedOptions.find(
        (entry) => entry.from === key.name
      );
      if (!replacement) {
        continue;
      }
      const rule: MarkerRule = {
        anchor: replacement.anchor,
        id: 'deprecated-client-option',
        message: `deprecated option; use \`${replacement.to}\``,
        names: [key.name],
      };
      annotate(ctx, path, property, rule);
    }
  }
}

export const markersRule: Rule = {
  apply: (ctx) => {
    markerMethodsRule(ctx);
    markerExportsRule(ctx);
    awaitDestroyRuleImpl(ctx);
    deprecatedClientOptionsRule(ctx);
    return true;
  },
  description:
    'Annotate judgment-required call sites with TODO(codemod) migration markers',
  id: 'markers',
  tier: 'breaking',
};
