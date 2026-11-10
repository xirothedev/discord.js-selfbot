import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export function walk(root: string): string[] {
  if (!statSync(root, { throwIfNoEntry: false })) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

export function writeTree(root: string, files: Map<string, string>): void {
  rmSync(root, { force: true, recursive: true });
  for (const [relative, content] of files) {
    const target = path.join(root, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

export function compareTrees(
  expectedRoot: string,
  actualRoot: string
): string[] {
  const expected = new Map(
    walk(expectedRoot).map((file) => [
      path.relative(expectedRoot, file),
      readFileSync(file, "utf-8"),
    ])
  );
  const actual = new Map(
    walk(actualRoot).map((file) => [
      path.relative(actualRoot, file),
      readFileSync(file, "utf-8"),
    ])
  );
  const diffs: string[] = [];

  for (const [file, content] of expected) {
    if (!actual.has(file)) {
      diffs.push(`missing: ${file}`);
    } else if (actual.get(file) !== content) {
      diffs.push(`changed: ${file}`);
    }
  }
  for (const file of actual.keys()) {
    if (!expected.has(file)) {
      diffs.push(`unexpected: ${file}`);
    }
  }

  return diffs.toSorted();
}
