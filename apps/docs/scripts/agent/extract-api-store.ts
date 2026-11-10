// One-time migration helper: builds api.json from the removed docgen JSON.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type {
  DocgenClass,
  DocgenData,
  DocgenEvent,
  DocgenMethod,
  DocgenParam,
  DocgenProp,
  DocgenType,
} from "../api/enrich";

const docgenPath = process.argv.at(2);
if (!docgenPath) {
  throw new Error("Usage: bun run extract-api-store.ts <docgen.json>");
}

const data = JSON.parse(readFileSync(docgenPath, "utf-8")) as DocgenData;

function compactParam(parameter: DocgenParam): DocgenParam {
  return {
    default: parameter.default,
    description: parameter.description,
    name: parameter.name,
    optional: parameter.optional,
  };
}

function compactProp(prop: DocgenProp): DocgenProp {
  return {
    access: prop.access,
    description: prop.description,
    name: prop.name,
  };
}

function compactMethod(method: DocgenMethod): DocgenMethod {
  const returns =
    method.returns &&
    typeof method.returns === "object" &&
    "description" in method.returns
      ? { description: method.returns.description }
      : undefined;

  return {
    access: method.access,
    description: method.description,
    examples: method.examples,
    name: method.name,
    params: method.params?.map(compactParam),
    returns,
  };
}

function compactEvent(event: DocgenEvent): DocgenEvent {
  return {
    description: event.description,
    name: event.name,
    params: event.params?.map(compactParam),
  };
}

function compactBase(entry: DocgenClass | DocgenType) {
  return {
    description: entry.description,
    meta: entry.meta,
    methods: entry.methods
      ?.filter((method) => method.access !== "private")
      .map(compactMethod),
    name: entry.name,
    props: entry.props
      ?.filter((prop) => prop.access !== "private")
      .map(compactProp),
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
  _meta: { source: "src JSDoc, one-time extraction" },
  classes: data.classes.map(compactClass),
  interfaces: data.interfaces.map(compactType),
  typedefs: data.typedefs.map(compactType),
};

const output = path.join(import.meta.dir, "api.json");
writeFileSync(output, `${JSON.stringify(store)}\n`);
console.log(
  `Wrote ${store.classes.length} classes, ${store.interfaces.length} interfaces, ${store.typedefs.length} typedefs.`
);
