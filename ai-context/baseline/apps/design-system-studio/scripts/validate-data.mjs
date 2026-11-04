import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateStudio } from '../src/data-model.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(process.env.AIC_REPO_ROOT || path.join(appRoot, '../../../..'));
const dataPath = path.join(repositoryRoot, 'ai-context/apps/design-system-studio/data/studio.json');
const value = JSON.parse(await readFile(dataPath, 'utf8'));
const errors = validateStudio(value);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`studio.json: valid (${value.components.length} components, ${value.layouts.length} layouts, ${value.screens.length} screens, ${value.flows.length} flows, ${value.mockups.length} mockups)`);
}
