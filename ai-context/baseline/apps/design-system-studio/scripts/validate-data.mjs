import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateStudio } from '../src/data-model.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(process.env.AIC_REPO_ROOT || path.join(appRoot, '../../../..'));
const configuredProjectDirectory = process.env.AIC_DESIGN_SYSTEM_DIR;
if (!configuredProjectDirectory) throw new Error('AIC_DESIGN_SYSTEM_DIR is required');
const designSystemDirectory = path.resolve(repositoryRoot, configuredProjectDirectory);
const relativeDesignSystemDirectory = path.relative(repositoryRoot, designSystemDirectory);
if (path.basename(designSystemDirectory) !== 'design-system') {
  throw new Error('AIC_DESIGN_SYSTEM_DIR must end with the design-system directory');
}
if (relativeDesignSystemDirectory.startsWith('..') || path.isAbsolute(relativeDesignSystemDirectory)) {
  throw new Error('AIC_DESIGN_SYSTEM_DIR must point inside the current repository');
}
if (relativeDesignSystemDirectory.startsWith('ai-context/baseline')) {
  throw new Error('AIC_DESIGN_SYSTEM_DIR cannot point inside immutable ai-context/baseline');
}
const dataPath = path.join(designSystemDirectory, 'studio.json');
const value = JSON.parse(await readFile(dataPath, 'utf8'));
const errors = validateStudio(value);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`studio.json: valid (${value.components.length} components, ${value.layouts.length} layouts, ${value.screens.length} screens, ${value.flows.length} flows, ${value.mockups.length} mockups)`);
}
