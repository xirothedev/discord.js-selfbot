// @ts-check
// Deep-module enforcement for dependency-cruiser.
//
// Each package under the packages root is a DEEP MODULE: a lot of behaviour
// behind a small interface. A package's PUBLIC SURFACE is its ENTRY POINTS:
// the files at the package root. Implementation lives in SUBFOLDERS and is
// private (by convention `lib/` for implementation and `tests/` for tests,
// though any subfolder is private). A package may expose several small entry
// points (index.ts, client.ts, server.ts, …); prefer that over one giant
// barrel index.
//
// The only thing you should ever need to edit here is PACKAGES_ROOT.

/** Where packages live. One immediate child dir per package (flat, no nesting). */
const PACKAGES_ROOT = 'src/packages';

// --- derived patterns (no need to edit) -------------------------------------
const ROOT = PACKAGES_ROOT;
/**
 * A package's private internals: anything nested inside a package subfolder.
 * The package's root files are its entry points and are NOT matched here:
 * they stay importable from outside.
 */
const PACKAGE_INTERNALS = `^${ROOT}/[^/]+/[^/]+/`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      comment:
        "App/root code may import a package's entry points (its root files), but nothing inside its subfolders.",
      // Importer is not inside any package.
      from: { pathNot: `^${ROOT}/` },
      name: 'entrypoint-boundary-from-app',
      severity: 'error',
      to: { path: PACKAGE_INTERNALS },
    },
    {
      comment:
        "A package's own files import each other freely, but may reach OTHER packages only through their entry points, never their internals.",
      // Importer is inside a package ($1), but is not a test file.
      from: { path: `^${ROOT}/([^/]+)/`, pathNot: `^${ROOT}/[^/]+/tests/` },
      name: 'entrypoint-boundary-across-packages',
      severity: 'error',
      to: {
        path: PACKAGE_INTERNALS,
        // Same package: intra-package freedom.
        pathNot: `^${ROOT}/$1/`,
      },
    },
    {
      comment:
        "A package's tests exercise it through its entry points like everyone else: they may import any package's entry points and their own tests/ fixtures, but never any package's internals, not even their own.",
      // A test file, in package $1.
      from: { path: `^${ROOT}/([^/]+)/tests/` },
      name: 'tests-through-entrypoints',
      severity: 'error',
      to: {
        path: PACKAGE_INTERNALS,
        // Own tests/ fixtures are allowed.
        pathNot: `^${ROOT}/$1/tests/`,
      },
    },
    {
      comment:
        "A package's tests/ folder is reachable only from tests: nothing else may import fixtures.",
      // The importer is not itself a test.
      from: { pathNot: `^${ROOT}/[^/]+/tests/` },
      name: 'tests-folder-is-private',
      severity: 'error',
      to: { path: `^${ROOT}/[^/]+/tests/` },
    },
    {
      comment: `No dependency cycles. Scope to ^\${ROOT}/ if you want to allow cycles outside packages.`,
      from: {},
      name: 'no-circular',
      severity: 'error',
      to: { circular: true },
    },

    // --- Layering (optional, off by default) ----------------------------------
    // Interface-hiding controls HOW you import (through the entry points).
    // Layering controls WHICH packages may depend on which. Add your own rules
    // here, e.g.:
    //
    // {
    //   name: "ui-may-not-depend-on-billing",
    //   severity: "error",
    //   from: { path: `^${ROOT}/ui/` },
    //   to:   { path: `^${ROOT}/billing/` },
    // },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
