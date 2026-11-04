import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { emptyStudio } from '../src/data-model.mjs';
import { loadProjectStudio, writeProjectStudio } from '../src/file-model.mjs';

test('project model writes and reloads one file per entity', async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'aic-design-system-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const value = emptyStudio();
  value.components.push({
    id: 'button', name: 'Button', kind: 'button', classification: 'atom',
    dependencies: [], properties: [], variants: [], sizes: [], states: [], actions: [], tokenRefs: [],
    responsiveBehavior: '', usage: '', restrictions: [],
  });
  value.layouts.push({
    id: 'shell', name: 'Shell', purpose: 'Test shell', regions: [{ id: 'content', name: 'Content', required: true }],
    navigationComponentIds: [], tokenRefs: [], widthRules: '', scrollRules: '', safeAreaRules: '', responsiveBehavior: '', openQuestions: [],
  });
  value.screens.push({
    id: 'home', name: 'Home', purpose: 'Test', userTask: 'Test', layoutId: 'shell', inputParameters: [], displayedData: [], actions: [], entryPoints: [], returnBehavior: '', adaptiveNotes: '', viewports: ['iphone-13-14'], states: [{ id: 'ready', name: 'Ready', blocks: [{ id: 'button-block', componentId: 'button', regionId: 'content' }] }], openQuestions: [],
  });

  await writeProjectStudio(directory, value);

  assert.deepEqual(await loadProjectStudio(directory), value);
  assert.equal(JSON.parse(await readFile(path.join(directory, 'components/atoms/button.json'), 'utf8')).id, 'button');
  assert.equal(JSON.parse(await readFile(path.join(directory, 'layouts/shell.json'), 'utf8')).id, 'shell');
  assert.equal(JSON.parse(await readFile(path.join(directory, 'screens/home.json'), 'utf8')).id, 'home');
  const manifest = JSON.parse(await readFile(path.join(directory, 'design-system.json'), 'utf8'));
  assert(!('components' in manifest));
  assert(!('screens' in manifest));
});

test('legacy studio.json is rejected instead of silently becoming canonical', async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'aic-design-system-legacy-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, 'studio.json'), '{}\n', 'utf8');
  await assert.rejects(() => loadProjectStudio(directory, { createIfMissing: true }), /Legacy studio\.json is not supported/);
});

test('filename must equal entity id', async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'aic-design-system-name-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await writeProjectStudio(directory, emptyStudio());
  await writeFile(path.join(directory, 'tokens/themes/wrong-name.json'), '{"id":"another-name","name":"Another"}\n', 'utf8');
  await assert.rejects(() => loadProjectStudio(directory), /must be named another-name\.json/);
});
