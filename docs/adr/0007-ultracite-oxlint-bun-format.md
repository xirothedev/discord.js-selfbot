# Ultracite Oxlint with Bun-native format and lint

**Status:** Accepted

The team baseline uses `bun lint` and `bun fmt`. The repo had a package-level
ESLint config and a light Oxlint default. Rules and style drifted per workspace.
We want one strict rule set and one Bun-native toolchain.

## Decision

- Lint with `bun lint` and the Ultracite `oxlint/core` preset in the root
  `oxlint.config.ts`. Add the Ultracite `next` and `react` presets for
  `apps/docs`.
- Format with `bun fmt` and the root `.oxfmtrc.json`. Keep the Ultracite values
  in the static JSON config. Do not add the `oxfmt` package.
- Remove the package `eslint` and `eslint-plugin-import` dependencies and the
  package `.eslintrc.json`.
- Run one root pass from the root scripts, and keep per-workspace tasks for
  targeted runs.
- Keep these rule overrides, each for a repo pattern:
  - `unicorn/filename-case`: PascalCase class files match discord.js v14.
  - `no-bitwise`: permission and flag bitfields are the domain.
  - `import/first`: `const { X } = module` lines protect circular dependencies.
  - `import/no-named-as-default` and `import/no-named-as-default-member`:
    default plus named exports are kept for v14 parity.
  - `import/no-cycle`: the object graph is circular by design.
  - `func-style` and `class-methods-use-this`: the public API is class based.
  - `unicorn/prefer-event-target`: `EventEmitter` is the public API.
  - `unicorn/prefer-set-has`: the fix changes array types.
  - `prefer-object-spread`: `Object.assign` keeps the `NodeJS.ProcessEnv` type
    for the shard env.
  - `no-plusplus`: the fixer breaks `i++ % 2`.
  - `no-unexpected-multiline`: the fixer breaks chained bracket calls.
  - `typescript/class-literal-property-style`: the fixer turns overridden
    getters into properties.
  - `require-await`: dropping `async` changes promise rejection behavior.
  - `eqeqeq` with `null: "ignore"`: `!= null` also excludes `undefined`.
- Ignore `typings/**` and the generated schema types in the linter.
  `schema:check` and `docs:agent:check` keep them current.
- Scoped overrides cover the cases a split cannot fix:
  - `max-lines` is off for public classes and coupled class graphs, where a
    split changes the public API or the circular import graph.
    `BaseMessageComponent` was split into a helpers module and re-exported.
    The schema generator keeps its single-pass top-level state.
  - `no-use-before-define` and `max-classes-per-file` are off for the
    `Presence`, `GuildAuditLogs`, and `VoiceConnection` cycles.
  - `typescript/method-signature-style` is off for the bivariant callback
    types in `Action` and `ClientVoiceManager`.
  - `no-eval` is off for the public `Client._eval` sharding API.
  - `no-await-in-loop` is off for the `Collector` async generator.

## Consequences

- The first pass reformatted the repo and fixed the mechanical findings. New
  code must pass the same rules.
- The overrides are intentional. Do not remove one without fixing the pattern
  first.
- The toolchain stays Bun-native: no `oxfmt` package, no per-app lint or format
  config.
