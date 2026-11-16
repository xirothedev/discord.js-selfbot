// Minimal typings for the jscodeshift surface this package uses.
// jscodeshift ships no types; only what ADR 0010 allows us to touch is declared
// (the factory, withParser, collection traversal, and testUtils applyTransform).

declare module 'jscodeshift' {
  export interface NodePath<TNode = unknown> {
    node: TNode;
    parent?: NodePath<unknown>;
  }

  export interface Collection<TNode = unknown> {
    readonly __paths: readonly NodePath<TNode>[];
    readonly toSource: (options?: Record<string, unknown>) => string;
  }

  export interface NamedType {
    readonly check: (node: unknown) => boolean;
  }

  export interface JSCodeShift {
    (source: string): Collection<unknown>;
    readonly withParser: (name: 'babel' | 'ts' | 'tsx' | 'flow') => JSCodeShift;
    readonly types: {
      readonly namedTypes: Record<string, NamedType>;
      readonly builders: Record<string, (...args: unknown[]) => unknown>;
    };
  }

  const core: JSCodeShift & ((source: string) => Collection<unknown>);
  export default core;
}

declare module 'jscodeshift/dist/testUtils' {
  import type { JSCodeShift } from 'jscodeshift';

  export interface FileInfo {
    path: string;
    source: string;
  }

  export interface TransformApi {
    jscodeshift: JSCodeShift;
    stats?: (label: string) => void;
    report?: (message: string) => void;
  }

  export type Transform = (
    fileInfo: FileInfo,
    api: TransformApi,
    options: Record<string, unknown>
  ) => string | undefined;

  export type ParserName = 'babel' | 'ts' | 'tsx' | 'flow';

  export function applyTransform(
    transform: Transform,
    options: Record<string, unknown>,
    fileInfo: FileInfo,
    testOptions?: { parser?: ParserName }
  ): string;
}
