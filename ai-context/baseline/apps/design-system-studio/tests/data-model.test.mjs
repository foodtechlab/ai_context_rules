import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { emptyStudio, migrateStudio, validateStudio } from '../src/data-model.mjs';

const starter = JSON.parse(await readFile(new URL('../../../templates/apps/design-system-studio/data/studio.json', import.meta.url), 'utf8'));

test('starter studio satisfies cross-reference validation', () => {
  assert.deepEqual(validateStudio(starter), []);
});

test('empty studio is a valid bootstrap model', () => {
  assert.deepEqual(validateStudio(emptyStudio()), []);
});

test('unknown components and transition endpoints are rejected', () => {
  const broken = structuredClone(starter);
  broken.screens[0].states[0].blocks[0].componentId = 'missing-component';
  broken.flows[0].transitions[0].target = 'missing-node';
  const errors = validateStudio(broken);
  assert(errors.some((error) => error.includes('unknown component')));
  assert(errors.some((error) => error.includes('unknown endpoint')));
});

test('legacy schema v1 data migrates deterministically to seven-section schema v2', () => {
  const legacy = {
    schemaVersion: 1,
    meta: { name: 'Legacy', description: '', updatedAt: new Date(0).toISOString() },
    themes: [{ id: 'light', name: 'Light', tokens: { color: { background: '#fff' } } }],
    components: [], screens: [], screenMaps: [], prototypes: [],
    adapterSettings: { packageName: 'legacy', webPrefix: 'legacy' },
  };

  const first = migrateStudio(legacy);
  const second = migrateStudio(legacy);

  assert.equal(first.migratedFrom, 1);
  assert.equal(first.value.schemaVersion, 2);
  assert.deepEqual(first.value.adapterSettings, { packageName: 'legacy', webPrefix: 'legacy' });
  assert.deepEqual(Object.keys(first.value).filter((key) => ['baseSystem', 'tokens', 'components', 'layouts', 'screens', 'flows', 'mockups'].includes(key)), ['baseSystem', 'tokens', 'components', 'layouts', 'screens', 'flows', 'mockups']);
  assert.deepEqual(first, second);
  assert.deepEqual(validateStudio(first.value), []);
});

test('future schema versions are rejected instead of being downgraded', () => {
  assert.throws(() => migrateStudio({ ...emptyStudio(), schemaVersion: 3 }), /newer than supported/);
});
