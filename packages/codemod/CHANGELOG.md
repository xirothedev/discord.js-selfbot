# @discord-selfbot/codemod

## 14.1.3

No changes in this release.

## 14.1.2

No changes in this release.

## 14.1.1

### Patch Changes

- e5126ad: Fix the published `discord-selfbot-codemod` bin: npm runs it through a
  `node_modules/.bin` symlink, so comparing `process.argv[1]` to
  `import.meta.url` never matched and the CLI exited silently. Compare
  realpaths instead, with a regression test for the symlink entry point.

## 14.1.0

No changes in this release.
