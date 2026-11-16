import type { Rule, RuleContext } from '../engine';
import {
  findBy,
  findObjectProperties,
  isCallTo,
  isObjectProperty,
  nodeString,
  renameIdentifier,
  rewriteStringNode,
} from '../ast';
import type { AstNode } from '../ast';
import {
  SOURCE_PACKAGE,
  TARGET_PACKAGE,
  modernizeExportRenames,
  tier1ExportRenames,
} from '../rename-map';
import type { ExportRename } from '../rename-map';

const packageSources = (): Set<string> =>
  new Set([SOURCE_PACKAGE, TARGET_PACKAGE]);

function rewriteSpecifiers(ctx: RuleContext): boolean {
  let changed = false;

  for (const path of findBy(ctx, ctx.ast.types.namedTypes.ImportDeclaration)) {
    if (nodeString(path.node.source as AstNode) !== SOURCE_PACKAGE) {
      continue;
    }
    rewriteStringNode(path.node.source as AstNode, TARGET_PACKAGE);
    ctx.count('module-specifier');
    changed = true;
  }

  for (const path of findBy(ctx, ctx.ast.types.namedTypes.CallExpression)) {
    if (!isCallTo(path.node.callee as AstNode, 'require')) {
      continue;
    }
    const [arg] = (path.node.arguments ?? []) as AstNode[];
    if (nodeString(arg) !== SOURCE_PACKAGE) {
      continue;
    }
    rewriteStringNode(arg, TARGET_PACKAGE);
    ctx.count('module-specifier');
    changed = true;
  }

  return changed;
}

function requireBindings(ctx: RuleContext): Map<string, boolean> {
  const sources = packageSources();
  const bindings = new Map<string, boolean>();
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.VariableDeclarator)) {
    const init = path.node.init as AstNode | null;
    if (
      !init ||
      init.type !== 'CallExpression' ||
      !isCallTo(init.callee as AstNode, 'require')
    ) {
      continue;
    }
    if (!sources.has(nodeString((init.arguments as AstNode[])[0]) ?? '')) {
      continue;
    }
    const id = path.node.id as AstNode;
    bindings.set(String(id.name), id.type === 'Identifier');
  }
  return bindings;
}

function namespaceNames(ctx: RuleContext): Set<string> {
  const sources = packageSources();
  const names = new Set<string>();
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.ImportDeclaration)) {
    const source = nodeString(path.node.source as AstNode);
    if (!source || !sources.has(source)) {
      continue;
    }
    for (const specifier of (path.node.specifiers ?? []) as AstNode[]) {
      if (
        specifier.type === 'ImportNamespaceSpecifier' ||
        specifier.type === 'ImportDefaultSpecifier'
      ) {
        names.add(String((specifier.local as AstNode).name));
      }
    }
  }
  for (const [name, bare] of requireBindings(ctx)) {
    if (bare) {
      names.add(name);
    }
  }
  return names;
}

function renameRequireDestructuring(
  ctx: RuleContext,
  from: string,
  to: string
): boolean {
  let touched = false;
  const sources = packageSources();
  for (const path of findObjectProperties(ctx)) {
    const declarator = path.parent?.parent?.node as AstNode | undefined;
    if (!declarator || declarator.type !== 'VariableDeclarator') {
      continue;
    }
    const { node } = path;
    if (!isObjectProperty(node)) {
      continue;
    }
    const key = node.key as AstNode;
    const value = node.value as AstNode;
    if (
      key.type !== 'Identifier' ||
      key.name !== from ||
      value.type !== 'Identifier' ||
      value.name !== from
    ) {
      continue;
    }
    const init = declarator.init as AstNode | null;
    if (
      !init ||
      init.type !== 'CallExpression' ||
      !isCallTo(init.callee as AstNode, 'require')
    ) {
      continue;
    }
    if (!sources.has(nodeString((init.arguments as AstNode[])[0]) ?? '')) {
      continue;
    }
    key.name = to;
    value.name = to;
    touched = true;
  }
  return touched;
}

function applyRenames(
  ctx: RuleContext,
  renames: readonly ExportRename[]
): boolean {
  const sources = packageSources();
  let changed = false;

  for (const { from, to } of renames) {
    let touched = false;

    for (const path of findBy(
      ctx,
      ctx.ast.types.namedTypes.ImportDeclaration
    )) {
      const source = nodeString(path.node.source as AstNode);
      if (!source || !sources.has(source)) {
        continue;
      }
      for (const specifier of (path.node.specifiers ?? []) as AstNode[]) {
        if (specifier.type !== 'ImportSpecifier') {
          continue;
        }
        const imported = specifier.imported as AstNode;
        const local = specifier.local as AstNode;
        if (imported.name !== from) {
          continue;
        }
        imported.name = to;
        if (local.name === from) {
          local.name = to;
        }
        touched = true;
      }
    }

    if (renameRequireDestructuring(ctx, from, to)) {
      touched = true;
    }

    const namespaces = namespaceNames(ctx);
    for (const path of findBy(ctx, ctx.ast.types.namedTypes.MemberExpression)) {
      if (path.node.computed) {
        continue;
      }
      const object = path.node.object as AstNode;
      const property = path.node.property as AstNode;
      if (object.type !== 'Identifier' || typeof object.name !== 'string') {
        continue;
      }
      if (property.type !== 'Identifier' || property.name !== from) {
        continue;
      }
      if (!namespaces.has(object.name)) {
        continue;
      }
      property.name = to;
      touched = true;
    }

    if (touched) {
      renameIdentifier(ctx, from, to);
      ctx.count(`export-rename:${from}->${to}`);
      changed = true;
    }
  }
  return changed;
}

function defaultToNamespace(ctx: RuleContext): boolean {
  const sources = packageSources();
  let changed = false;
  for (const path of findBy(ctx, ctx.ast.types.namedTypes.ImportDeclaration)) {
    const source = nodeString(path.node.source as AstNode);
    if (!source || !sources.has(source)) {
      continue;
    }
    const specifiers = (path.node.specifiers ?? []) as AstNode[];
    const target = specifiers.find(
      (specifier) => specifier.type === 'ImportDefaultSpecifier'
    );
    if (!target) {
      continue;
    }
    const next = [...specifiers];
    next[specifiers.indexOf(target)] = {
      comments: target.comments,
      local: target.local,
      type: 'ImportNamespaceSpecifier',
    };
    (
      path as unknown as {
        get: (name: string) => { replace: (value: unknown) => void };
      }
    )
      .get('specifiers')
      .replace(next);
    ctx.count('default-to-namespace');
    changed = true;
  }
  return changed;
}

export const moduleSpecifierRule: Rule = {
  apply: rewriteSpecifiers,
  description:
    'Rewrite discord.js-selfbot-v13 specifiers to @discord-selfbot/core',
  id: 'module-specifier',
  tier: 'breaking',
};

export const breakingRenamesRule: Rule = {
  apply: (ctx) => applyRenames(ctx, tier1ExportRenames),
  description:
    'Rename exports that no longer exist (MessageSelectMenu, MessageSelectMenuOption)',
  id: 'breaking-renames',
  tier: 'breaking',
};

export const modernizeAliasesRule: Rule = {
  apply: (ctx) => applyRenames(ctx, modernizeExportRenames),
  description:
    'Rewrite deprecated v13 builder names to canonical v14 builder names',
  id: 'modernize-aliases',
  tier: 'modernize',
};

export const defaultToNamespaceRule: Rule = {
  apply: defaultToNamespace,
  description: 'Convert default imports of the package to namespace imports',
  id: 'default-to-namespace',
  tier: 'modernize',
};
