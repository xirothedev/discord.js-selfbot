import ts from "typescript";

import type { ParsedExports, PublicExport } from "./types";

function isExternal(path: string): boolean {
  return !path.startsWith("./") && !path.startsWith("../");
}

function isMetadata(path: string): boolean {
  return path.startsWith("../");
}

function isExported(statement: ts.Statement): boolean {
  const modifiers = ts.canHaveModifiers(statement)
    ? ts.getModifiers(statement)
    : undefined;
  return (
    modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    ) ?? false
  );
}

type NamedDeclaration =
  | ts.ClassDeclaration
  | ts.EnumDeclaration
  | ts.FunctionDeclaration
  | ts.InterfaceDeclaration
  | ts.TypeAliasDeclaration;

function isNamedDeclaration(
  statement: ts.Statement
): statement is NamedDeclaration {
  return (
    ts.isClassDeclaration(statement) ||
    ts.isFunctionDeclaration(statement) ||
    ts.isEnumDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement)
  );
}

function parseExportDeclaration(
  statement: ts.ExportDeclaration,
  file: ts.SourceFile,
  result: ParsedExports
): void {
  const specifier = statement.moduleSpecifier;
  if (!specifier || !ts.isStringLiteral(specifier)) {
    result.unparsed.push(statement.getText(file));
    return;
  }

  const path = specifier.text;
  if (isMetadata(path)) {
    return;
  }

  const clause = statement.exportClause;
  if (!clause || !ts.isNamedExports(clause)) {
    result.unparsed.push(statement.getText(file));
    return;
  }

  for (const element of clause.elements) {
    const name = element.name.text;
    const target = element.propertyName?.text;

    if (isExternal(path)) {
      result.external.push(name);
      continue;
    }

    // `export { Target as Alias }` is the v13 alias shape. `default as X`
    // names the class itself, so it stays public.
    if (target && target !== "default" && target !== name) {
      result.aliases.push({ name, target });
      continue;
    }

    const namedExport: string | undefined =
      target === "default" ? undefined : (target ?? name);
    result.public.push({
      name,
      namedExport,
      path,
      ...(statement.isTypeOnly ? { typeOnly: true } : {}),
    });
  }
}

function parseVariableStatement(
  statement: ts.VariableStatement,
  file: ts.SourceFile,
  result: ParsedExports
): void {
  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name)) {
      result.unparsed.push(declaration.getText(file));
      continue;
    }

    result.public.push({
      name: declaration.name.text,
      namedExport: undefined,
      path: "./index",
    });
  }
}

function parseNamedDeclaration(
  statement: NamedDeclaration,
  file: ts.SourceFile,
  result: ParsedExports
): void {
  const name = statement.name?.text;
  const typeOnly =
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement);
  if (name) {
    result.public.push({
      name,
      namedExport: undefined,
      path: "./index",
      ...(typeOnly ? { typeOnly: true } : {}),
    });
  } else {
    result.unparsed.push(statement.getText(file));
  }
}

export function parseIndexExports(source: string): ParsedExports {
  const result: ParsedExports = {
    aliases: [],
    external: [],
    public: [],
    unparsed: [],
  };
  const file = ts.createSourceFile(
    "index.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  for (const statement of file.statements) {
    if (ts.isExportDeclaration(statement)) {
      parseExportDeclaration(statement, file, result);
      continue;
    }

    if (ts.isVariableStatement(statement) && isExported(statement)) {
      parseVariableStatement(statement, file, result);
      continue;
    }

    if (isNamedDeclaration(statement) && isExported(statement)) {
      parseNamedDeclaration(statement, file, result);
      continue;
    }

    if (ts.isExportAssignment(statement)) {
      result.unparsed.push(statement.getText(file));
    }
  }

  return result;
}

export const AREA_ORDER = [
  { id: "client", title: "Client" },
  { id: "structures", title: "Structures" },
  { id: "managers", title: "Managers" },
  { id: "rest", title: "REST" },
  { id: "voice", title: "Voice" },
  { id: "sharding", title: "Sharding" },
  { id: "utilities", title: "Utilities" },
  { id: "packages", title: "Packages" },
  { id: "typings", title: "Typings" },
  { id: "other", title: "Other" },
] as const;

export type AreaId = (typeof AREA_ORDER)[number]["id"];

export function areaFor(path: string): AreaId {
  if (path.startsWith("./client/voice")) {
    return "voice";
  }
  if (path.startsWith("./client")) {
    return "client";
  }
  if (path.startsWith("./structures")) {
    return "structures";
  }
  if (path.startsWith("./managers")) {
    return "managers";
  }
  if (path.startsWith("./rest")) {
    return "rest";
  }
  if (path.startsWith("./sharding")) {
    return "sharding";
  }
  if (path.startsWith("./util")) {
    return "utilities";
  }
  if (path.startsWith("./packages")) {
    return "packages";
  }
  if (path === "./WebSocket") {
    return "client";
  }
  return "other";
}

export function slugify(name: string): string {
  return name
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$1-$2")
    .replaceAll(/(?<acronym>[A-Z]+)(?<word>[A-Z][a-z])/gu, "$1-$2")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");
}

export function sortByName(exports: PublicExport[]): PublicExport[] {
  return [...exports].toSorted((left, right) =>
    left.name.localeCompare(right.name)
  );
}
