export const Kind = {
  Module: 2,
  Variable: 32,
  Function: 64,
  Class: 128,
  Interface: 256,
  Constructor: 512,
  Property: 1024,
  Method: 2048,
  Signature: 4096,
  TypeAlias: 2097152,
  Accessor: 262144,
} as const;

export interface SourceRef {
  fileName: string;
  line: number;
  character?: number;
  url?: string;
}

export interface CommentPart {
  kind: string;
  text?: string;
  tag?: string;
  target?: unknown;
}

export interface BlockTag {
  tag: string;
  content?: CommentPart[];
  name?: string;
}

export interface Comment {
  summary?: CommentPart[];
  blockTags?: BlockTag[];
  modifierTags?: string[];
}

export interface Parameter {
  name: string;
  type?: TypeNode;
  flags?: Record<string, boolean | undefined>;
  comment?: Comment;
  defaultValue?: string;
}

export interface TypeParameter {
  name: string;
  type?: TypeNode;
  default?: TypeNode;
}

export interface Signature {
  name: string;
  comment?: Comment;
  parameters?: Parameter[];
  type?: TypeNode;
  typeParameters?: TypeParameter[];
  flags?: Record<string, boolean | undefined>;
}

export interface TypeNode {
  type: string;
  name?: string;
  types?: TypeNode[];
  elementType?: TypeNode;
  typeArguments?: TypeNode[];
  value?: unknown;
  declaration?: Reflection;
  elements?: TypeNode[];
  objectType?: TypeNode;
  indexType?: TypeNode;
  operator?: string;
  target?: unknown;
  queryType?: TypeNode;
  checkType?: TypeNode;
  extendsType?: TypeNode;
  trueType?: TypeNode;
  falseType?: TypeNode;
  [key: string]: unknown;
}

export interface Reflection {
  id: number;
  name: string;
  kind: number;
  variant?: string;
  comment?: Comment;
  children?: Reflection[];
  signatures?: Signature[];
  getSignature?: Signature;
  setSignature?: Signature;
  type?: TypeNode;
  sources?: SourceRef[];
  flags?: Record<string, boolean | undefined>;
  extendedTypes?: TypeNode[];
  implementedTypes?: TypeNode[];
  typeParameters?: TypeParameter[];
  defaultValue?: string;
}

export interface Project {
  children?: Reflection[];
}

export interface PublicExport {
  name: string;
  path: string;
  namedExport?: string;
}

export interface ParsedExports {
  public: PublicExport[];
  aliases: Array<{ name: string; target: string }>;
  external: string[];
  unparsed: string[];
}

export interface RenderContext {
  sourceUrl?: string;
}
