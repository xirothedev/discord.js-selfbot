export const Kind = {
  Accessor: 262_144,
  Class: 128,
  Constructor: 512,
  Function: 64,
  Interface: 256,
  Method: 2048,
  Module: 2,
  Property: 1024,
  Signature: 4096,
  TypeAlias: 2_097_152,
  Variable: 32,
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
  typeOnly?: boolean;
}

export interface DocgenEventParam {
  name: string;
  description?: string;
  optional?: boolean;
}

export interface DocgenEvent {
  name: string;
  description?: string;
  params?: DocgenEventParam[];
}

export interface ParsedExports {
  public: PublicExport[];
  aliases: { name: string; target: string }[];
  external: string[];
  unparsed: string[];
}

export interface RenderContext {
  sourceUrl?: string;
}
