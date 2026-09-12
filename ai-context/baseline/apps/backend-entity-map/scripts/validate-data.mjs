import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCombinedDatasets, validateDataset } from '../src/data-model.js';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(process.env.AIC_REPO_ROOT || path.join(appRoot, '../../../..'));
const dataDirectory = path.join(repositoryRoot, 'ai-context/apps/backend-entity-map/data');

let failed = false;
const datasets = {};
for (const [fileName, layer] of [['generated.json', 'generated'], ['user.json', 'user']]) {
  const filePath = path.join(dataDirectory, fileName);
  try {
    const value = JSON.parse(await readFile(filePath, 'utf8'));
    datasets[layer] = value;
    const errors = validateDataset(value, layer);
    if (errors.length) {
      failed = true;
      console.error(`${fileName}: ${errors.join('; ')}`);
    } else {
      console.log(`${fileName}: valid`);
    }
  } catch (error) {
    failed = true;
    console.error(`${fileName}: ${error.message}`);
  }
}

if (!failed) {
  const errors = validateCombinedDatasets(datasets.generated, datasets.user);
  if (errors.length) {
    failed = true;
    console.error(`combined dataset: ${errors.join('; ')}`);
  } else {
    console.log('combined dataset: valid');
  }
}

if (failed) process.exitCode = 1;
