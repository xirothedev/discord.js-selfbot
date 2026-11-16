---
'@discord-selfbot/codemod': patch
---

Fix the published `discord-selfbot-codemod` bin: npm runs it through a
`node_modules/.bin` symlink, so comparing `process.argv[1]` to
`import.meta.url` never matched and the CLI exited silently. Compare
realpaths instead, with a regression test for the symlink entry point.
