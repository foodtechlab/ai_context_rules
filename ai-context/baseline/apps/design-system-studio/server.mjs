import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateStudio } from './src/data-model.mjs';
import { DESIGN_SYSTEM_MANIFEST, loadProjectStudio, writeProjectStudio } from './src/file-model.mjs';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(process.env.AIC_REPO_ROOT || path.join(appRoot, '../../../..'));
const configuredProjectDirectory = process.env.AIC_DESIGN_SYSTEM_DIR;
if (!configuredProjectDirectory) {
  throw new Error('AIC_DESIGN_SYSTEM_DIR is required, for example: apps/mobile/design-system');
}
const designSystemDirectory = path.resolve(repositoryRoot, configuredProjectDirectory);
const relativeDesignSystemDirectory = path.relative(repositoryRoot, designSystemDirectory);
const isRepositoryExample = relativeDesignSystemDirectory.split(path.sep)[0] === 'examples'
  && path.basename(designSystemDirectory).startsWith('design-system-');
if (path.basename(designSystemDirectory) !== 'design-system' && !isRepositoryExample) {
  throw new Error('AIC_DESIGN_SYSTEM_DIR must end with design-system; named examples are allowed under examples/design-system-*');
}
if (relativeDesignSystemDirectory.startsWith('..') || path.isAbsolute(relativeDesignSystemDirectory)) {
  throw new Error('AIC_DESIGN_SYSTEM_DIR must point inside the current repository');
}
if (relativeDesignSystemDirectory.startsWith('ai-context/baseline')) {
  throw new Error('AIC_DESIGN_SYSTEM_DIR cannot point inside immutable ai-context/baseline');
}
const designSystemManifestPath = path.join(designSystemDirectory, DESIGN_SYSTEM_MANIFEST);
const isProduction = process.argv.includes('--production');
const port = Number(process.env.PORT || 4174);

async function readStudio() {
  return loadProjectStudio(designSystemDirectory, { createIfMissing: true });
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

server.get('/api/project-context', (_request, response) => {
  response.json({
    repositoryRoot,
    designSystemDirectory,
    designSystemManifestPath,
  });
});

server.put('/api/studio', async (request, response, next) => {
  try {
    const errors = validateStudio(request.body);
    if (errors.length) {
      response.status(400).json({ error: errors.join('; ') });
      return;
    }
    const value = {
      ...request.body,
      meta: { ...request.body.meta, updatedAt: new Date().toISOString() },
    };
    await writeProjectStudio(designSystemDirectory, value);
    response.json({ saved: true, studio: value });
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
  console.log(`Project design system: ${designSystemDirectory}`);
  console.log(`Design system manifest: ${designSystemManifestPath}`);
  console.log('Project entities: one JSON file per token, component, layout, screen, flow and mockup');
});
