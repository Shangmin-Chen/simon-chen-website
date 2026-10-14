import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('gallery preparation CLI retains its authoring dependencies and usage entrypoint', () => {
  // No images or output folders are created; module imports happen before
  // the CLI rejects missing arguments, catching dependency cleanup regressions.
  const result = spawnSync(process.execPath, ['scripts/resize-gallery.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: node scripts\/resize-gallery.mjs/);
});
