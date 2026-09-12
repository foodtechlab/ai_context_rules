import express from 'express';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  emptyGeneratedData,
  emptyUserData,
  validateCombinedDatasets,
  validateDataset,
} from './src/data-model.js';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(process.env.AIC_REPO_ROOT || path.join(appRoot, '../../../..'));
const dataDirectory = path.join(repositoryRoot, 'ai-context/apps/backend-entity-map/data');
const generatedDataPath = path.join(dataDirectory, 'generated.json');
const userDataPath = path.join(dataDirectory, 'user.json');
const isProduction = process.argv.includes('--production');
const port = Number(process.env.PORT || 4173);

async function readJson(filePath, fallback, layer) {
  try {
    const value = JSON.parse(await readFile(filePath, 'utf8'));
    const errors = validateDataset(value, layer);
    if (errors.length) {
      throw new Error(`${path.basename(filePath)}: ${errors.join('; ')}`);
    }
    return value;
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
    await writeJsonAtomic(filePath, fallback);
    return fallback;
  }
}

async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, filePath);
}

const server = express();
server.use(express.json({ limit: '2mb' }));

server.get('/api/dataset', async (_request, response, next) => {
  try {
    const [generated, user] = await Promise.all([
      readJson(generatedDataPath, emptyGeneratedData(), 'generated'),
      readJson(userDataPath, emptyUserData(), 'user'),
    ]);
    const errors = validateCombinedDatasets(generated, user);
    if (errors.length) throw new Error(errors.join('; '));
    response.json({ generated, user });
  } catch (error) {
    next(error);
  }
});

server.put('/api/user-data', async (request, response, next) => {
  try {
    const generated = await readJson(generatedDataPath, emptyGeneratedData(), 'generated');
    const errors = validateCombinedDatasets(generated, request.body);
    if (errors.length) {
      response.status(400).json({ error: errors.join('; ') });
      return;
    }
    await writeJsonAtomic(userDataPath, request.body);
    response.json({ saved: true, user: request.body });
  } catch (error) {
    next(error);
  }
});

if (isProduction) {
  server.use(express.static(path.join(appRoot, 'dist')));
  server.use((request, response, next) => {
    if (request.method !== 'GET') {
      next();
      return;
    }
    response.sendFile(path.join(appRoot, 'dist/index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: appRoot,
    server: { middlewareMode: true },
    appType: 'spa',
  });
  server.use(vite.middlewares);
}

server.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: error.message || 'Unexpected server error' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Backend Entity Map: http://localhost:${port}`);
  console.log(`Repository data: ${dataDirectory}`);
});
