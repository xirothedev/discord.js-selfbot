import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export interface GenerateResult {
  ok: boolean;
  files: string[];
}

const docsDir = path.resolve(import.meta.dir, "../..");
const apiDir = path.join(docsDir, "content/docs/api");

export function meta(title: string, pages: string[]): string {
  return `${JSON.stringify({ pages, title }, null, 2)}\n`;
}

function collectFiles(root: string, current = root): Map<string, string> {
  const files = new Map<string, string>();
  if (!existsSync(current)) {
    return files;
  }

  for (const entry of readdirSync(current)) {
    const full = path.join(current, entry);
    if (statSync(full).isDirectory()) {
      for (const [file, content] of collectFiles(root, full)) {
        files.set(file, content);
      }
    } else {
      files.set(path.relative(root, full), readFileSync(full, "utf-8"));
    }
  }
  return files;
}

export function compareOutputs(outputs: Map<string, string>): GenerateResult {
  const existing = collectFiles(apiDir);
  const missing = [...outputs.keys()].filter((file) => !existing.has(file));
  const extra = [...existing.keys()].filter((file) => !outputs.has(file));
  const changed = [...outputs.keys()].filter(
    (file) => existing.has(file) && existing.get(file) !== outputs.get(file)
  );

  if (missing.length || extra.length || changed.length) {
    console.error("API reference is stale.");
    if (missing.length) {
      console.error(`Missing: ${missing.slice(0, 10).join(", ")}`);
    }
    if (extra.length) {
      console.error(`Extra: ${extra.slice(0, 10).join(", ")}`);
    }
    if (changed.length) {
      console.error(`Changed: ${changed.slice(0, 10).join(", ")}`);
    }
    return { files: [...outputs.keys()], ok: false };
  }

  return { files: [...outputs.keys()], ok: true };
}

export function writeOutputs(outputs: Map<string, string>): GenerateResult {
  rmSync(apiDir, { force: true, recursive: true });
  for (const [file, content] of outputs) {
    const full = path.join(docsDir, "content/docs", file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content.endsWith("\n") ? content : `${content}\n`);
  }
  return { files: [...outputs.keys()], ok: true };
}
