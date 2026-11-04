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
  broken.screenMaps[0].edges[0].target = 'missing-node';
  const errors = validateStudio(broken);
  assert(errors.some((error) => error.includes('unknown component')));
  assert(errors.some((error) => error.includes('unknown endpoint')));
});

test('legacy unversioned studio data migrates deterministically to schema v1', () => {
  const legacy = emptyStudio();
  delete legacy.schemaVersion;
  delete legacy.adapterSettings;

  const first = migrateStudio(legacy);
  const second = migrateStudio(legacy);

  assert.equal(first.migratedFrom, 0);
  assert.equal(first.value.schemaVersion, 1);
  assert.deepEqual(first.value.adapterSettings, { packageName: 'design_system', webPrefix: 'ds' });
  assert.deepEqual(first, second);
  assert.deepEqual(validateStudio(first.value), []);
});

test('future schema versions are rejected instead of being downgraded', () => {
  assert.throws(() => migrateStudio({ ...emptyStudio(), schemaVersion: 2 }), /newer than supported/);
});
