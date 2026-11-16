// Release gate for the published Node entry points (ADR 0013): both dist
// formats must load and expose the public surface under plain Node. Run via
// `bun run test:node` (needs `bun run build` first).
import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const distDir = path.join(import.meta.dirname, '..', 'dist', 'node');

function checkSurface(moduleExports, format) {
  assert.strictEqual(
    typeof moduleExports.Client,
    'function',
    `${format}: missing Client`
  );
  assert.strictEqual(
    typeof moduleExports.Message,
    'function',
    `${format}: missing Message`
  );
  assert.strictEqual(
    moduleExports.Events.CLIENT_READY,
    'ready',
    `${format}: bad Events`
  );
  assert.strictEqual(
    typeof moduleExports.ButtonBuilder,
    'function',
    `${format}: missing ButtonBuilder`
  );
}

const cjs = require(path.join(distDir, 'index.cjs'));
checkSurface(cjs, 'cjs');
// Lazy sibling seams must work through the bundle, not the source tree:
// MessageActionRow.create walks BaseMessageComponent's require-based factory.
const row = cjs.MessageActionRow.create({ components: [], type: 1 });
assert.ok(row, 'cjs: lazy sibling require broken');

const esm = await import(pathToFileURL(path.join(distDir, 'index.mjs')).href);
checkSurface(esm, 'esm');
assert.strictEqual(
  typeof cjs.Client,
  typeof esm.Client,
  'format mismatch between cjs and esm entries'
);
process.stdout.write('node dist smoke ok (cjs + esm)\n');
