import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { emptyStudio, validateStudio } from '../src/data-model.mjs';

const starter = JSON.parse(await readFile(new URL('../../../templates/apps/design-system-studio/project/studio.json', import.meta.url), 'utf8'));

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

test('a different schema version is rejected without implicit migration', () => {
  assert(validateStudio({ ...emptyStudio(), schemaVersion: 2 }).some((error) => error.includes('schemaVersion must equal 1')));
});
