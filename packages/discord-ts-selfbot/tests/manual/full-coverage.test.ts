import { test, describe } from "bun:test";

import * as discord from "../../src/index";
import { skip, makeClient, login, makeStepRecorder } from "./_helpers";

interface JsonSerializable {
  toJSON: () => unknown;
}

interface SettableCollection {
  set: (key: string, value: unknown) => unknown;
}

const CONSTANT_EXPORTS = new Set([
  "Constants",
  "Events",
  "Options",
  "Partials",
  "Status",
]);

function tryConstruct(value: unknown, args: unknown[]): unknown {
  if (typeof value !== "function") {
    return undefined;
  }
  try {
    return Reflect.construct(value, args);
  } catch {
    return undefined;
  }
}

function canConstruct(value: unknown, args: unknown[]): boolean {
  return tryConstruct(value, args) !== undefined;
}

function hasToJSON(value: unknown): value is JsonSerializable {
  return (
    typeof value === "object" &&
    value !== null &&
    "toJSON" in value &&
    typeof value.toJSON === "function"
  );
}

function hasSet(value: unknown): value is SettableCollection {
  return (
    typeof value === "object" &&
    value !== null &&
    "set" in value &&
    typeof value.set === "function"
  );
}

function touchBuilder(value: unknown): void {
  const instance = tryConstruct(value, []) ?? tryConstruct(value, [{}]);
  if (hasToJSON(instance)) {
    try {
      instance.toJSON();
    } catch {
      // Some builders need fields before they can serialise.
    }
  }
}

function touchBitField(value: unknown): void {
  const instance = tryConstruct(value, [0]) ?? tryConstruct(value, []);
  if (instance === undefined) {
    throw new Error("bitfield is not constructible");
  }
}

function touchError(value: unknown): void {
  if (!canConstruct(value, ["msg"])) {
    canConstruct(value, []);
  }
}

function touchCollection(value: unknown): void {
  const instance = tryConstruct(value, []);
  if (hasSet(instance)) {
    instance.set("entry", 1);
  }
}

function touchUtility(key: string): boolean {
  if (key === "Util") {
    discord.Util.resolveColor(0xff_00_00);
    discord.Util.flatten({ outer: { inner: 1 } });
    return true;
  }
  if (key === "SnowflakeUtil") {
    discord.SnowflakeUtil.generate();
    return true;
  }
  if (key === "DataResolver") {
    discord.DataResolver.resolveBase64("x");
    return true;
  }
  if (key === "Formatters") {
    if (typeof discord.Formatters.bold === "function") {
      discord.Formatters.bold("x");
    }
    return true;
  }
  return false;
}

function touchExport(
  key: string,
  value: unknown,
  client: ReturnType<typeof makeClient>
): void {
  if (value === undefined || value === null) {
    throw new Error("undefined export");
  }
  // Builders: construct + toJSON (best effort)
  if (key.endsWith("Builder")) {
    touchBuilder(value);
    return;
  }
  // BitFields / Flags: construct
  if (key.endsWith("BitField") || key.endsWith("Flags")) {
    touchBitField(value);
    return;
  }
  // Errors: construct
  if (key.endsWith("Error")) {
    touchError(value);
    return;
  }
  // Collections
  if (key === "Collection" || key === "LimitedCollection") {
    touchCollection(value);
    return;
  }
  // Pure utility classes: try a known static method
  if (touchUtility(key)) {
    return;
  }
  // Client: verify the logged in user exists
  if (key === "Client") {
    if (!client.user) {
      throw new Error("no user");
    }
    return;
  }
  // Constants / Events / Options / Partials / Status: verify object
  if (CONSTANT_EXPORTS.has(key)) {
    if (typeof value !== "object" && typeof value !== "function") {
      throw new TypeError("not object/function");
    }
    return;
  }
  // Structures that can be fetched from client
  if (key === "Guild" || key === "User") {
    if (typeof value !== "function") {
      throw new TypeError("not a class");
    }
    return;
  }
  // Default: defined is enough, but try no-arg construction
  tryConstruct(value, []);
}

describe.skipIf(skip)("manual: full-coverage (all exports)", () => {
  test("touch every export", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);

      const entries = Object.entries(discord).toSorted(
        ([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)
      );
      let queue = Promise.resolve();
      for (const [key, value] of entries) {
        queue = queue.then(() =>
          step(`export: ${key}`, () => touchExport(key, value, client))
        );
      }
      await queue;
    } finally {
      client.destroy();
    }
    summary("manual: full-coverage");
    await writeArtifact("manual-full-coverage-results");
  }, 600_000);
});
