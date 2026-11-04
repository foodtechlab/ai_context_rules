import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { defaultViewportPresets, emptyStudio, validateStudio } from '../src/data-model.mjs';
import { loadProjectStudio } from '../src/file-model.mjs';

const starterDirectory = fileURLToPath(new URL('../../../templates/apps/design-system-studio/project/', import.meta.url));
const starter = await loadProjectStudio(starterDirectory);

test('starter studio satisfies cross-reference validation', () => {
  assert.deepEqual(validateStudio(starter), []);
});

test('empty studio is a valid bootstrap model', () => {
  const studio = emptyStudio();
  assert.deepEqual(validateStudio(studio), []);
  assert.equal(studio.settings.defaultViewportId, 'iphone-13-14');
  assert.equal(studio.settings.viewportPresets.length, 14);
  assert.deepEqual(studio.settings.viewportPresets, defaultViewportPresets);
});

test('unknown components and transition endpoints are rejected', () => {
  const broken = structuredClone(starter);
  broken.screens[0].states[0].blocks[0].componentId = 'missing-component';
  broken.screens[0].viewports.push('missing-viewport');
  broken.flows[0].transitions[0].target = 'missing-node';
  const errors = validateStudio(broken);
  assert(errors.some((error) => error.includes('unknown component')));
  assert(errors.some((error) => error.includes('unknown viewport')));
  assert(errors.some((error) => error.includes('unknown endpoint')));
});

test('a different schema version is rejected without implicit migration', () => {
  assert(validateStudio({ ...emptyStudio(), schemaVersion: 2 }).some((error) => error.includes('schemaVersion must equal 1')));
});

test('ids must be portable standalone filenames', () => {
  const broken = structuredClone(starter);
  broken.components[0].id = 'component:inside-monolith';
  assert(validateStudio(broken).some((error) => error.includes('portable as a filename')));
});

test('layouts are containers with a content region and screen blocks use known slots', () => {
  const withoutContent = structuredClone(starter);
  withoutContent.layouts[0].regions = withoutContent.layouts[0].regions.filter((region) => region.id !== 'content');
  assert(validateStudio(withoutContent).some((error) => error.includes('must define a content region for children')));

  const unknownRegion = structuredClone(starter);
  unknownRegion.screens[0].states[0].blocks[0].regionId = 'missing-slot';
  assert(validateStudio(unknownRegion).some((error) => error.includes('unknown layout region')));
});
