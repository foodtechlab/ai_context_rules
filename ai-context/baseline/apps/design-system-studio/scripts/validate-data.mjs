import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadProjectStudio } from '../src/file-model.mjs';
import { resolveProjectDesignSystemDirectory } from '../src/project-path.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(process.env.AIC_REPO_ROOT || path.join(appRoot, '../../../..'));
const { designSystemDirectory } = resolveProjectDesignSystemDirectory(repositoryRoot, process.env.AIC_DESIGN_SYSTEM_DIR);
const value = await loadProjectStudio(designSystemDirectory);
console.log(`Project files: valid (${value.components.length} components, ${value.layouts.length} layouts, ${value.screens.length} screens, ${value.flows.length} flows, ${value.mockups.length} mockups)`);
