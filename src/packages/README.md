# Packages (deep modules)

Each directory here is a **deep module**: a lot of behaviour behind a small interface.

## Layout

```
src/packages/
  <name>/
    index.ts        # entry point (public)
    client.ts       # another entry point (public) — packages may expose several
    lib/            # implementation (private)
    tests/          # tests + fixtures (private)
```

## Rules

1. **Import only through a package's entry points** (its root files). Never import anything in a subfolder from outside the package.
2. **Intra-package freedom**: a package's own files import each other freely.
3. **Tests go through entry points**: tests may import any package's entry points and their own `tests/` fixtures, never internals.
4. **No cycles.**

Enforced by `npm run lint:boundaries` (dependency-cruiser). Any subfolder is private, so adding a folder never needs a config change; adding an entry point is just adding a root file.

## Discourage barrels

Prefer several small entry points (`index.ts`, `client.ts`, `server.ts`) over one giant `index.ts` that re-exports a whole subtree. Barrel files hide the interface and defeat the purpose of a deep module.

## Copy-me template

See `example/`. Copy it, rename, and replace the implementation. Delete `example/` when you no longer need it.
