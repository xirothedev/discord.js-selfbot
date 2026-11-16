import type { Rule, RuleContext } from '../engine';
import {
  enclosingStatement,
  ensureNamedImport,
  findBy,
  nodeString,
  prependMarkerComment,
} from '../ast';
import type { AstNode } from '../ast';
import {
  TARGET_PACKAGE,
  deadEvents,
  deadEventsRule,
  migrationMarker,
} from '../rename-map';
import { eventConstants } from '../generated/event-constants';

const LISTENER_METHODS = new Set([
  'on',
  'once',
  'off',
  'removeListener',
  'addListener',
  'prependListener',
  'prependOnceListener',
]);

function rewriteEvents(ctx: RuleContext): boolean {
  let changed = false;

  for (const path of findBy(ctx, ctx.ast.types.namedTypes.CallExpression)) {
    const callee = path.node.callee as AstNode;
    if (!callee || callee.type !== 'MemberExpression' || callee.computed) {
      continue;
    }
    const property = callee.property as AstNode;
    if (property.type !== 'Identifier' || typeof property.name !== 'string') {
      continue;
    }
    if (!LISTENER_METHODS.has(property.name)) {
      continue;
    }
    const args = (path.node.arguments ?? []) as AstNode[];
    const value = nodeString(args[0]);
    if (!value) {
      continue;
    }
    const key = eventConstants[value];
    if (!key) {
      continue;
    }
    if (deadEvents.includes(value)) {
      prependMarkerComment(
        ctx,
        enclosingStatement(path),
        deadEventsRule.id,
        migrationMarker(
          deadEventsRule.id,
          deadEventsRule.message,
          deadEventsRule.anchor
        )
      );
      ctx.mark(
        path.node,
        deadEventsRule.id,
        deadEventsRule.message,
        deadEventsRule.anchor
      );
    }
    const replacement = {
      computed: false,
      object: ctx.ast.types.builders.identifier('Events') as unknown as AstNode,
      property: ctx.ast.types.builders.identifier(key) as unknown as AstNode,
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
    ensureNamedImport(ctx, TARGET_PACKAGE, 'Events');
    ctx.count('events-constant');
    changed = true;
  }

  return changed;
}

export const eventsRule: Rule = {
  apply: rewriteEvents,
  description:
    'Rewrite raw event name strings to Events.* constants (value-preserving)',
  id: 'events-constants',
  tier: 'modernize',
};
