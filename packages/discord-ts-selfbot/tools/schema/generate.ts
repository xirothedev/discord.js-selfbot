import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

type FieldKind = 'api' | 'selfbot' | 'internal' | 'relation';

interface ImportSpec {
  from: string;
  named?: string[];
  default?: string;
}

interface EntityConfig {
  imports: ImportSpec[];
  fields?: Record<string, FieldKind>;
  extends?: string;
  rawType?: { name: string; from: string };
  patchType?: { type: string; from: string };
  fieldTypes?: Record<string, string>;
  extraFields?: Array<{ name: string; type: string; kind: FieldKind }>;
}

interface Field {
  name: string;
  type: string;
  publicType: string;
  runtimeType: string;
  optional: boolean;
}

interface Drift {
  entity: string;
  field: string;
  publicType: string;
  runtimeType: string;
}

interface EntityResult {
  name: string;
  file: string;
  fields: Field[];
  assignedNotDeclared: string[];
  declaredNotAssigned: string[];
  drift: Drift[];
  rawType?: { name: string; from: string };
}

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = join(HERE, '..', '..');
const SRC = join(PKG, 'src');
const TYPINGS = join(PKG, 'typings');
const ENTITIES = join(SRC, 'types', 'entities');
const SCHEMA = join(SRC, 'types', 'schema.ts');
const TSCONFIG = join(PKG, 'tsconfig.json');

/**
 * Per-entity import and provenance configuration.
 *
 * `imports` maps type identifiers used by the entity to their module. The
 * generator fails when a type identifier is not covered, so a new field type
 * cannot silently produce an unimported name.
 */
const CONFIG: Record<string, EntityConfig> = {
  Role: {
    imports: [
      { from: 'discord-api-types/v10', named: ['Snowflake'] },
      { from: '../../../typings', named: ['RoleColors', 'RoleTagData'] },
      { from: '../../structures/Guild', named: ['Guild'] },
      { from: '../../util/Permissions', default: 'Permissions' },
      { from: '../../util/RoleFlags', default: 'RoleFlags' },
    ],
    fields: { guild: 'relation' },
  },
  User: {
    rawType: { name: 'SelfbotUserData', from: './selfbot/user' },
    imports: [
      { from: 'discord-api-types/v10', named: ['Snowflake'] },
      { from: '../../../typings', named: ['AvatarDecorationData', 'Collectibles', 'UserPrimaryGuild'] },
      { from: '../../util/UserFlags', default: 'UserFlags' },
    ],
    fields: { bannerColor: 'selfbot' },
  },
  ClientUser: {
    extends: 'UserEntity',
    rawType: { name: 'SelfbotClientUserData', from: './selfbot/user' },
    imports: [
      { from: '../../util/PremiumUsageFlags', default: 'PremiumUsageFlags' },
      { from: '../../util/PurchasedFlags', default: 'PurchasedFlags' },
    ],
    fields: {
      phone: 'selfbot',
      bio: 'selfbot',
      pronouns: 'selfbot',
      nsfwAllowed: 'selfbot',
      purchasedFlags: 'selfbot',
      premiumUsageFlags: 'selfbot',
    },
  },
  AutoModerationRule: {
    rawType: { name: 'APIAutoModerationRule', from: 'discord-api-types/v10' },
    imports: [
      { from: 'discord-api-types/v10', named: ['Snowflake'] },
      { from: '@discordjs/collection', named: ['Collection'] },
      {
        from: '../../../typings',
        named: [
          'AutoModerationAction',
          'AutoModerationRuleEventType',
          'AutoModerationRuleTriggerType',
          'AutoModerationTriggerMetadata',
          'GuildBasedChannel',
        ],
      },
      { from: '../../structures/Guild', named: ['Guild'] },
      { from: '../../structures/Role', named: ['Role'] },
    ],
    fields: { guild: 'relation' },
    fieldTypes: { exemptRoles: 'Collection<Snowflake, Role>' },
  },
  GuildBoost: {
    rawType: { name: 'SelfbotGuildBoostData', from: './selfbot/guild-boost' },
    imports: [{ from: 'discord-api-types/v10', named: ['Snowflake'] }],
    fields: {},
  },
  VoiceState: {
    rawType: { name: 'RawVoiceStateData', from: '../../typings/rawDataTypes' },
    imports: [
      { from: 'discord-api-types/v10', named: ['Snowflake'] },
      { from: '../../structures/Guild', named: ['Guild'] },
    ],
    fields: { guild: 'relation' },
  },
  GuildMember: {
    rawType: { name: 'RawGuildMemberData', from: '../../typings/rawDataTypes' },
    patchType: { type: 'GuildMemberPatch', from: './selfbot/guild-member' },
    imports: [
      { from: '../../../typings', named: ['AvatarDecorationData'] },
      { from: '../../structures/Guild', named: ['Guild'] },
      { from: '../../structures/User', named: ['User'] },
      { from: '../../util/GuildMemberFlags', default: 'GuildMemberFlags' },
    ],
    fields: { guild: 'relation', _roles: 'internal' },
    extraFields: [{ name: '_roles', type: 'string[]', kind: 'internal' }],
  },
};

const BUILTIN_TYPES = new Set([
  'Array',
  'BigInt',
  'Boolean',
  'Date',
  'Error',
  'Function',
  'Map',
  'Number',
  'Object',
  'Omit',
  'Partial',
  'Pick',
  'Promise',
  'Readonly',
  'Record',
  'Required',
  'Set',
  'String',
  'Symbol',
]);

const configFile = ts.readConfigFile(TSCONFIG, ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, PKG);
const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
const checker = program.getTypeChecker();
const isAssignable = (
  checker as unknown as { isTypeAssignableTo(source: ts.Type, target: ts.Type): boolean }
).isTypeAssignableTo.bind(checker);
const sourceFiles = new Map(program.getSourceFiles().map(sf => [sf.fileName, sf]));

function getSource(file: string): ts.SourceFile {
  const sf = sourceFiles.get(ts.sys.resolvePath(file)) ?? sourceFiles.get(file);
  if (!sf) throw new Error(`Source file not found: ${file}`);
  return sf;
}

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(path, out);
    else if (entry.name.endsWith('.ts')) out.push(path);
  }
  return out;
}

function findClass(sf: ts.SourceFile, name: string): ts.ClassDeclaration | undefined {
  let found: ts.ClassDeclaration | undefined;
  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node) && node.name?.text === name) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

function getThisRoot(expr: ts.Expression): string | undefined {
  if (ts.isPropertyAccessExpression(expr)) {
    if (expr.expression.kind === ts.SyntaxKind.ThisKeyword) return expr.name.text;
    return getThisRoot(expr.expression);
  }
  if (ts.isNonNullExpression(expr) || ts.isParenthesizedExpression(expr)) return getThisRoot(expr.expression);
  return undefined;
}

function collectAssignments(classNode: ts.ClassDeclaration): Map<string, ts.Type[]> {
  const result = new Map<string, ts.Type[]>();
  const add = (prop: string, type: ts.Type): void => {
    const list = result.get(prop) ?? [];
    list.push(type);
    result.set(prop, list);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isBinaryExpression(node)) {
      const kind = node.operatorToken.kind;
      if (kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment) {
        const prop = getThisRoot(node.left);
        if (prop) {
          const rhsOnly =
            kind === ts.SyntaxKind.EqualsToken ||
            kind === ts.SyntaxKind.QuestionQuestionEqualsToken ||
            kind === ts.SyntaxKind.BarBarEqualsToken ||
            kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken;
          add(prop, checker.getTypeAtLocation(rhsOnly ? node.right : node));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(classNode);
  return result;
}

interface Declared {
  name: string;
  typeText: string;
  type: ts.Type;
  optional: boolean;
}

function collectDeclared(classNode: ts.ClassDeclaration, sf: ts.SourceFile): Declared[] {
  const out: Declared[] = [];
  for (const member of classNode.members) {
    if (!ts.isPropertyDeclaration(member)) continue;
    const modifiers = ts.getModifiers(member) ?? [];
    if (
      modifiers.some(
        m =>
          m.kind === ts.SyntaxKind.StaticKeyword ||
          m.kind === ts.SyntaxKind.PrivateKeyword ||
          m.kind === ts.SyntaxKind.ProtectedKeyword,
      )
    )
      continue;
    const name = member.name.getText(sf);
    if (name.startsWith('#') || !member.type) continue;
    out.push({
      name,
      typeText: member.type.getText(sf).replace(/\s+/g, ' ').trim(),
      type: checker.getTypeAtLocation(member.type),
      optional: Boolean(member.questionToken),
    });
  }
  return out;
}

function safeTypeText(type: ts.Type): string {
  const text = checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation).replace(/\s+/g, ' ').trim();
  return text === 'any' ? 'unknown' : text;
}

function formatUnion(texts: string[]): string {
  const parts = new Set<string>();
  for (const text of texts) for (const part of text.split(' | ')) if (part.trim()) parts.add(part.trim());
  return [...parts]
    .sort((a, b) => {
      const rank = (value: string): number => (value === 'null' ? 1 : value === 'undefined' ? 2 : 0);
      return rank(a) - rank(b) || a.localeCompare(b);
    })
    .join(' | ');
}

const typingsSf = getSource(join(TYPINGS, 'index.d.ts'));
const rawSf = getSource(join(TYPINGS, 'rawDataTypes.d.ts'));
const structureFiles = walkFiles(join(SRC, 'structures'));
const classFiles = new Map<string, string>();
for (const file of structureFiles) {
  const sf = getSource(file);
  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node) && node.name) classFiles.set(node.name.text, file);
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

function findRawAlias(name: string): string | undefined {
  let found: string | undefined;
  rawSf.forEachChild(node => {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === `Raw${name}Data`) found = node.name.text;
  });
  return found;
}

function analyze(name: string, file: string): EntityResult | undefined {
  const typingsClass = findClass(typingsSf, name);
  const srcClass = findClass(getSource(file), name);
  if (!typingsClass || !srcClass) return undefined;
  const declared = collectDeclared(typingsClass, typingsSf);
  const assignments = collectAssignments(srcClass);
  const declaredNames = new Set(declared.map(prop => prop.name));
  const fields: Field[] = [];
  const drift: Drift[] = [];

  for (const prop of declared) {
    const types = assignments.get(prop.name);
    if (!types?.length) continue;
    const runtimeType = formatUnion(types.map(safeTypeText));
    // The public typings redeclare the classes instead of importing the src
    // classes, so nominal assignability fails even when the printed types are
    // identical. Text equality is the practical identity check across layers.
    const checkAssignable = (type: ts.Type): boolean => {
      if (prop.optional && (type.flags & ts.TypeFlags.Undefined) !== 0) return true;
      if (type.isUnion()) {
        const members = prop.optional
          ? type.types.filter(member => (member.flags & ts.TypeFlags.Undefined) === 0)
          : type.types;
        return members.every(member => checkAssignable(member));
      }
      try {
        return isAssignable(type, prop.type);
      } catch {
        return false;
      }
    };
    const assignable = prop.typeText === runtimeType || types.every(checkAssignable);
    const override = CONFIG[name]?.fieldTypes?.[prop.name];
    fields.push({
      name: prop.name,
      type: override ?? (assignable ? prop.typeText : runtimeType),
      publicType: prop.typeText,
      runtimeType,
      optional: prop.optional,
    });
    if (!override && !assignable) {
      drift.push({ entity: name, field: prop.name, publicType: prop.typeText, runtimeType });
    }
  }

  const extraFields = CONFIG[name]?.extraFields ?? [];
  for (const extra of extraFields) {
    fields.push({
      name: extra.name,
      type: extra.type,
      publicType: extra.type,
      runtimeType: extra.type,
      optional: false,
    });
  }

  const assignedNames = new Set(assignments.keys());
  const extraNames = new Set(extraFields.map(field => field.name));
  return {
    name,
    file,
    fields,
    assignedNotDeclared: [...assignedNames]
      .filter(prop => !declaredNames.has(prop) && !extraNames.has(prop) && prop !== 'client' && !prop.startsWith('#'))
      .sort(),
    declaredNotAssigned: declared
      .map(prop => prop.name)
      .filter(prop => !assignedNames.has(prop))
      .sort(),
    drift,
  };
}

function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function identifiers(type: string): Set<string> {
  const out = new Set<string>();
  for (const match of type.matchAll(/[A-Za-z_$][\w$]*/g)) {
    const id = match[0];
    if (/^[A-Z]/.test(id) && !BUILTIN_TYPES.has(id)) out.add(id);
  }
  return out;
}

function renderImports(name: string, fields: Field[]): string {
  const config = CONFIG[name];
  if (!config) throw new Error(`No import config for ${name}`);
  const used = new Set<string>();
  for (const field of fields) for (const id of identifiers(field.type)) used.add(id);
  const covered = new Set<string>();
  const lines: string[] = [];
  for (const spec of config.imports) {
    const named = (spec.named ?? []).filter(id => used.has(id));
    if (spec.default && used.has(spec.default)) {
      lines.push(`import type ${spec.default} from '${spec.from}';`);
      covered.add(spec.default);
    }
    if (named.length) {
      lines.push(`import type { ${named.join(', ')} } from '${spec.from}';`);
      for (const id of named) covered.add(id);
    }
  }
  const missing = [...used].filter(id => !covered.has(id));
  if (missing.length) throw new Error(`Missing imports for ${name}: ${missing.join(', ')}`);
  return lines.join('\n');
}

function renderFields(fields: Record<string, FieldKind> | undefined): string {
  const entries = Object.entries(fields ?? {});
  if (entries.length === 0) return 'Record<never, never>';
  return `{ ${entries.map(([key, value]) => `${key}: '${value}'`).join('; ')} }`;
}

function generateEntity(result: EntityResult): string {
  const file = relative(PKG, result.file).replaceAll('\\', '/');
  const config = CONFIG[result.name];
  if (!config) throw new Error(`No import config for ${result.name}`);
  const rawType = result.rawType?.name ?? `Raw${result.name}Data`;
  const extendsImport = config.extends
    ? `import type { ${config.extends} } from './${kebab(config.extends.replace(/Entity$/, ''))}';\n`
    : '';
  const body = result.fields.map(field => `  ${field.name}${field.optional ? '?' : ''}: ${field.type};`).join('\n');
  const extendsClause = config.extends ? ` extends ${config.extends}` : '';
  return `// @generated by tools/schema/generate.ts — do not edit by hand.
// Run \`bun run schema:generate\` from the package to update.

${extendsImport}${renderImports(result.name, result.fields)}

/**
 * The object shape of a \`${result.name}\`.
 *
 * Derived from the public \`${result.name}\` class in \`typings/index.d.ts\` and the
 * assignments in \`${file}\`. The wire shape is \`${rawType}\`.
 */
export interface ${result.name}Entity${extendsClause} {
${body}
}
`;
}

function generateSchema(results: EntityResult[]): string {
  const generated = results
    .filter(result => result.rawType && generatedNames.has(result.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const rawImports = new Map<string, string[]>();
  const patchImports = new Map<string, string[]>();
  for (const result of generated) {
    const raw = result.rawType!;
    const rawNames = rawImports.get(raw.from) ?? [];
    rawNames.push(raw.name);
    rawImports.set(raw.from, rawNames);
    const patch = CONFIG[result.name]?.patchType;
    if (patch) {
      const patchNames = patchImports.get(patch.from) ?? [];
      patchNames.push(patch.type);
      patchImports.set(patch.from, patchNames);
    }
  }
  const imports = [
    ...[...rawImports.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([from, names]) => `import type { ${names.join(', ')} } from '${from}';`),
    ...[...patchImports.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([from, names]) => `import type { ${names.join(', ')} } from '${from}';`),
    ...generated.map(result => `import type { ${result.name}Entity } from './entities/${kebab(result.name)}';`),
  ].join('\n');
  const entries = generated
    .map(result => {
      const patch = CONFIG[result.name]?.patchType;
      const patchGeneric = patch ? `, Partial<${patch.type}>` : '';
      return `  ${result.name}: EntityEntry<${result.rawType!.name}, ${result.name}Entity, ${renderFields(
        CONFIG[result.name]?.fields,
      )}${patchGeneric}>;`;
    })
    .join('\n');
  return `// @generated by tools/schema/generate.ts — do not edit by hand.
// Run \`bun run schema:generate\` from the package to update.

${imports}

/**
 * The provenance of a field on an entity.
 *
 * - \`api\`: a standard Discord bot API field.
 * - \`selfbot\`: a user-account field that is not in \`discord-api-types\`.
 * - \`internal\`: a cache or bookkeeping field owned by this library.
 * - \`relation\`: a field that points at another structure.
 */
export type FieldKind = 'api' | 'selfbot' | 'internal' | 'relation';

export interface EntityEntry<
  Raw,
  Entity,
  Fields extends Partial<Record<keyof Entity, FieldKind>>,
  Patch = Partial<Raw>,
> {
  raw: Raw;
  entity: Entity;
  fields: Fields;
  patch: Patch;
}

/**
 * The entity database: one row per structure, pairing the wire shape with the
 * object shape and tagging the fields that are not plain API data.
 */
export type EntitySchema = {
${entries}
};

export type EntityName = keyof EntitySchema;
export type RawOf<K extends EntityName> = EntitySchema[K]['raw'];
export type EntityOf<K extends EntityName> = EntitySchema[K]['entity'];
export type PatchOf<K extends EntityName> = EntitySchema[K]['patch'];
`;
}

function checkFile(path: string, content: string): boolean {
  if (!existsSync(path)) {
    console.error(`missing ${relative(PKG, path)}`);
    return false;
  }
  const current = readFileSync(path, 'utf8');
  // `bun fmt` may wrap long type entries; compare tokens, not line breaks.
  // Formatting itself is enforced separately by `bun fmt:check`.
  const normalize = (text: string): string => text.replace(/\s+/g, '').replace(/[,;]+}/g, '}');
  if (normalize(current) === normalize(content)) return true;
  const actual = current.split('\n');
  const expected = content.split('\n');
  for (let i = 0; i < Math.max(actual.length, expected.length); i++) {
    if (actual[i] !== expected[i]) {
      console.error(`mismatch ${relative(PKG, path)}:${i + 1}`);
      console.error(`  actual:   ${actual[i] ?? '<eof>'}`);
      console.error(`  expected: ${expected[i] ?? '<eof>'}`);
      break;
    }
  }
  return false;
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const report = args.includes('--report');
const filter =
  args.find(arg => arg.startsWith('--entity='))?.slice('--entity='.length) ??
  (args.includes('--entity') ? args[args.indexOf('--entity') + 1] : undefined);
const generatedNames = new Set(Object.keys(CONFIG));

const results: EntityResult[] = [];
for (const [name, file] of [...classFiles.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (filter && name !== filter) continue;
  const result = analyze(name, file);
  if (!result) continue;
  const alias = findRawAlias(name);
  result.rawType = CONFIG[name]?.rawType ?? (alias ? { name: alias, from: '../../typings/rawDataTypes' } : undefined);
  results.push(result);
}

if (report) {
  const drift = results.flatMap(result => result.drift);
  console.log(
    JSON.stringify(
      {
        entities: results,
        totals: {
          entities: results.length,
          fields: results.reduce((sum, result) => sum + result.fields.length, 0),
          assignedNotDeclared: results.reduce((sum, result) => sum + result.assignedNotDeclared.length, 0),
          drift: drift.length,
        },
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (check) {
  let ok = true;
  for (const result of results) {
    if (!generatedNames.has(result.name) || !result.rawType) continue;
    ok = checkFile(join(ENTITIES, `${kebab(result.name)}.ts`), generateEntity(result)) && ok;
  }
  if (!filter) ok = checkFile(SCHEMA, generateSchema(results)) && ok;

  process.exit(ok ? 0 : 1);
}

mkdirSync(ENTITIES, { recursive: true });
let written = 0;
for (const result of results) {
  if (!generatedNames.has(result.name) || !result.rawType) continue;
  writeFileSync(join(ENTITIES, `${kebab(result.name)}.ts`), generateEntity(result));
  written++;
}
if (!filter) writeFileSync(SCHEMA, generateSchema(results));
console.log(`generated ${written} entities`);
