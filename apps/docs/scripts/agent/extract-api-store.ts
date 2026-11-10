// One-time migration helper: builds api.json from the removed docgen JSON.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type {
  DocgenClass,
  DocgenData,
  DocgenEvent,
  DocgenMethod,
  DocgenParam,
  DocgenProp,
  DocgenType,
} from '../api/enrich';

const docgenPath = process.argv[2];
if (!docgenPath) throw new Error('Usage: bun run extract-api-store.ts <docgen.json>');

const data = JSON.parse(readFileSync(docgenPath, 'utf8')) as DocgenData;

function compactParam(parameter: DocgenParam): DocgenParam {
  return {
    name: parameter.name,
    description: parameter.description,
    optional: parameter.optional,
    default: parameter.default,
  };
}

function compactProp(prop: DocgenProp): DocgenProp {
  return { name: prop.name, description: prop.description, access: prop.access };
}

function compactMethod(method: DocgenMethod): DocgenMethod {
  const returns =
    method.returns && typeof method.returns === 'object' && 'description' in method.returns
      ? { description: method.returns.description }
      : undefined;

  return {
    name: method.name,
    description: method.description,
    params: method.params?.map(compactParam),
    returns,
    examples: method.examples,
    access: method.access,
  };
}

function compactEvent(event: DocgenEvent): DocgenEvent {
  return {
    name: event.name,
    description: event.description,
    params: event.params?.map(compactParam),
  };
}

function compactBase(entry: DocgenClass | DocgenType) {
  return {
    name: entry.name,
    description: entry.description,
    meta: entry.meta,
    props: entry.props?.filter((prop) => prop.access !== 'private').map(compactProp),
    methods: entry.methods?.filter((method) => method.access !== 'private').map(compactMethod),
  };
}

function compactClass(entry: DocgenClass): DocgenClass {
  return {
    ...compactBase(entry),
    construct: entry.construct
      ? {
          description: entry.construct.description,
          params: entry.construct.params?.map(compactParam),
        }
      : undefined,
    events: entry.events?.map(compactEvent),
  };
}

function compactType(entry: DocgenType): DocgenType {
  return compactBase(entry);
}

const store = {
  _meta: { source: 'src JSDoc, one-time extraction' },
  classes: data.classes.map(compactClass),
  interfaces: data.interfaces.map(compactType),
  typedefs: data.typedefs.map(compactType),
};

const output = path.join(import.meta.dir, 'api.json');
writeFileSync(output, `${JSON.stringify(store)}\n`);
console.log(
  `Wrote ${store.classes.length} classes, ${store.interfaces.length} interfaces, ${store.typedefs.length} typedefs.`,
);
