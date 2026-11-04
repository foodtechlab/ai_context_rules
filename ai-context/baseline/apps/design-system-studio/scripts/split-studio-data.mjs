import { readFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';

import { validateStudio } from '../src/data-model.mjs';
import { LEGACY_STUDIO_FILE, loadProjectStudio, writeProjectStudio } from '../src/file-model.mjs';

const directoryArgument = process.argv[2];
if (!directoryArgument) throw new Error('Usage: node scripts/split-studio-data.mjs <design-system-directory>');

const invocationDirectory = process.env.INIT_CWD || process.cwd();
const designSystemDirectory = path.resolve(invocationDirectory, directoryArgument);
const legacyPath = path.join(designSystemDirectory, LEGACY_STUDIO_FILE);
const backupPath = `${legacyPath}.splitting`;
const value = JSON.parse(await readFile(legacyPath, 'utf8'));
const errors = validateStudio(value);
if (errors.length) throw new Error(errors.join('; '));

await writeProjectStudio(designSystemDirectory, value);
await rename(legacyPath, backupPath);
try {
  await loadProjectStudio(designSystemDirectory);
  await unlink(backupPath);
} catch (error) {
  await rename(backupPath, legacyPath);
  throw error;
}

console.log(`Split ${legacyPath} into project-owned entity files.`);
