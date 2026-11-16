import core from 'jscodeshift';
import type { Collection, JSCodeShift, NodePath } from 'jscodeshift';
import type { FileInfo } from 'jscodeshift/dist/testUtils';

export type ParserName = 'babel' | 'ts' | 'tsx' | 'flow';

export function parserForPath(path: string): ParserName {
  if (path.endsWith('.tsx')) {
    return 'tsx';
  }
  if (path.endsWith('.ts') || path.endsWith('.mts') || path.endsWith('.cts')) {
    return 'ts';
  }
  return 'babel';
}

export interface Todo {
  readonly file: string;
  readonly line: number;
  readonly ruleId: string;
  readonly message: string;
  readonly anchor: string;
}

export type Tier = 'breaking' | 'modernize';

export interface RuleContext {
  readonly ast: JSCodeShift;
  readonly root: Collection;
  readonly fileInfo: FileInfo;
  readonly options: Record<string, unknown>;
  readonly count: (ruleId: string) => void;
  readonly mark: (
    node: NodePath<AstLoc> | AstLoc,
    ruleId: string,
    message: string,
    anchor: string
  ) => void;
}

interface AstLoc {
  loc?: { start?: { line?: number } } | null;
}

export interface Rule {
  readonly id: string;
  readonly tier: Tier;
  readonly description: string;
  readonly apply: (ctx: RuleContext) => boolean;
}

export interface FileOutcome {
  readonly path: string;
  readonly status: 'ok' | 'nochange' | 'error';
  readonly output: string;
  readonly error?: string;
  readonly stats: Record<string, number>;
  readonly todos: Todo[];
}

export function runRulesOnSource(
  fileInfo: FileInfo,
  rules: readonly Rule[],
  options: Record<string, unknown>
): FileOutcome {
  const stats: Record<string, number> = {};
  const todos: Todo[] = [];
  let { source } = fileInfo;

  for (const rule of rules) {
    let ast: JSCodeShift;
    try {
      ast = core.withParser(parserForPath(fileInfo.path));
    } catch (error) {
      return {
        error: String(error),
        output: source,
        path: fileInfo.path,
        stats,
        status: 'error',
        todos,
      };
    }
    try {
      const root = ast(source);
      const context: RuleContext = {
        ast,
        count: (ruleId) => {
          stats[ruleId] = (stats[ruleId] ?? 0) + 1;
        },
        fileInfo: { ...fileInfo, source },
        mark: (node, ruleId, message, anchor) => {
          const target = 'node' in node ? node.node : node;
          todos.push({
            anchor,
            file: fileInfo.path,
            line: target.loc?.start?.line ?? 1,
            message,
            ruleId,
          });
        },
        options,
        root,
      };
      const changed = rule.apply(context);
      if (changed) {
        const next = root.toSource();
        if (next !== source) {
          source = next;
        }
      }
    } catch (error) {
      return {
        error: `${rule.id}: ${String(error)}`,
        output: source,
        path: fileInfo.path,
        stats,
        status: 'error',
        todos,
      };
    }
  }

  return {
    output: source,
    path: fileInfo.path,
    stats,
    status: source === fileInfo.source ? 'nochange' : 'ok',
    todos,
  };
}
