import express from 'express';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { emptyStudio, migrateStudio, validateStudio } from './src/data-model.mjs';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(process.env.AIC_REPO_ROOT || path.join(appRoot, '../../../..'));
const dataDirectory = path.join(repositoryRoot, 'ai-context/apps/design-system-studio/data');
const studioDataPath = path.join(dataDirectory, 'studio.json');
const isProduction = process.argv.includes('--production');
const port = Number(process.env.PORT || 4174);

async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, filePath);
}

async function readStudio() {
  try {
    const parsed = JSON.parse(await readFile(studioDataPath, 'utf8'));
    const { value, migratedFrom } = migrateStudio(parsed);
    const errors = validateStudio(value);
    if (errors.length) throw new Error(errors.join('; '));
    if (migratedFrom !== null) await writeJsonAtomic(studioDataPath, value);
    return value;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    const value = emptyStudio();
    await writeJsonAtomic(studioDataPath, value);
    return value;
  }
}

const server = express();
server.use(express.json({ limit: '5mb' }));

server.get('/api/studio', async (_request, response, next) => {
  try {
    response.json(await readStudio());
  } catch (error) {
    next(error);
  }
});

server.put('/api/studio', async (request, response, next) => {
  try {
    const { value: migrated, migratedFrom } = migrateStudio(request.body);
    const errors = validateStudio(migrated);
    if (errors.length) {
      response.status(400).json({ error: errors.join('; ') });
      return;
    }
    const value = {
      ...migrated,
      meta: { ...migrated.meta, updatedAt: new Date().toISOString() },
    };
    await writeJsonAtomic(studioDataPath, value);
    response.json({ saved: true, migratedFrom, studio: value });
  } catch (error) {
    next(error);
  }
});

if (isProduction) {
  server.use(express.static(path.join(appRoot, 'dist')));
  server.use((request, response, next) => {
    if (request.method !== 'GET') return next();
    response.sendFile(path.join(appRoot, 'dist/index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({ root: appRoot, server: { middlewareMode: true }, appType: 'spa' });
  server.use(vite.middlewares);
}

server.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: error.message || 'Unexpected server error' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Design System Studio: http://localhost:${port}`);
  console.log(`Repository data: ${studioDataPath}`);
});
