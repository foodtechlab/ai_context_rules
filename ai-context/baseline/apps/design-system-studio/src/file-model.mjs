import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { emptyStudio, validateStudio } from './data-model.mjs';

export const DESIGN_SYSTEM_MANIFEST = 'design-system.json';
export const LEGACY_STUDIO_FILE = 'studio.json';

const tokenCategories = ['colors', 'typography', 'parameters'];
const tokenTiers = ['base', 'semantic', 'component'];
const componentDirectories = { atom: 'atoms', molecule: 'molecules', organism: 'organisms' };
const portableId = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

async function pathExists(filePath) {
  try { await readFile(filePath); return true; }
  catch (error) { if (error?.code === 'ENOENT') return false; throw error; }
}

async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, filePath);
}

function fileNameForId(id) {
  if (!portableId.test(id)) throw new Error(`id is not portable as a filename: ${id}`);
  return `${id}.json`;
}

async function readJsonDirectory(directory, label) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error?.code === 'ENOENT') return []; throw error; }
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name));
  return Promise.all(files.map(async (entry) => {
    const filePath = path.join(directory, entry.name);
    const value = JSON.parse(await readFile(filePath, 'utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value) || typeof value.id !== 'string') throw new Error(`${label}/${entry.name} must contain one object with id`);
    if (entry.name !== fileNameForId(value.id)) throw new Error(`${label}/${entry.name} must be named ${fileNameForId(value.id)}`);
    return value;
  }));
}

function validateManifest(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['design-system.json must contain an object'];
  const allowed = new Set(['schemaVersion', 'meta', 'settings', 'adapterSettings']);
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`design-system.json contains unsupported property: ${key}`);
  if (value.schemaVersion !== 1) errors.push('design-system.json schemaVersion must equal 1');
  if (!value.meta || typeof value.meta.name !== 'string' || !value.meta.name) errors.push('design-system.json meta.name is required');
  if (!value.settings || typeof value.settings !== 'object') errors.push('design-system.json settings are required');
  if (!value.adapterSettings || typeof value.adapterSettings.packageName !== 'string' || typeof value.adapterSettings.webPrefix !== 'string') errors.push('design-system.json adapterSettings are required');
  return errors;
}

export async function loadProjectStudio(designSystemDirectory, { createIfMissing = false } = {}) {
  const legacyPath = path.join(designSystemDirectory, LEGACY_STUDIO_FILE);
  if (await pathExists(legacyPath)) throw new Error(`Legacy ${LEGACY_STUDIO_FILE} is not supported. Split it into project-owned entity files before starting Studio.`);

  const manifestPath = path.join(designSystemDirectory, DESIGN_SYSTEM_MANIFEST);
  if (!await pathExists(manifestPath)) {
    if (!createIfMissing) throw new Error(`${DESIGN_SYSTEM_MANIFEST} is required`);
    const value = emptyStudio();
    await writeProjectStudio(designSystemDirectory, value);
    return value;
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const manifestErrors = validateManifest(manifest);
  if (manifestErrors.length) throw new Error(manifestErrors.join('; '));

  const baseSystemPath = path.join(designSystemDirectory, 'base-system', 'base-system.json');
  const baseSystem = JSON.parse(await readFile(baseSystemPath, 'utf8'));
  const themes = await readJsonDirectory(path.join(designSystemDirectory, 'tokens', 'themes'), 'tokens/themes');
  const tokens = { themes };
  for (const category of tokenCategories) {
    tokens[category] = {};
    for (const tier of tokenTiers) tokens[category][tier] = await readJsonDirectory(path.join(designSystemDirectory, 'tokens', category, tier), `tokens/${category}/${tier}`);
  }

  const components = [];
  for (const [classification, directory] of Object.entries(componentDirectories)) {
    const values = await readJsonDirectory(path.join(designSystemDirectory, 'components', directory), `components/${directory}`);
    for (const value of values) {
      if (value.classification !== classification) throw new Error(`component ${value.id} classification must match directory ${directory}`);
      components.push(value);
    }
  }

  const value = {
    ...manifest,
    baseSystem,
    tokens,
    components,
    layouts: await readJsonDirectory(path.join(designSystemDirectory, 'layouts'), 'layouts'),
    screens: await readJsonDirectory(path.join(designSystemDirectory, 'screens'), 'screens'),
    flows: await readJsonDirectory(path.join(designSystemDirectory, 'flows'), 'flows'),
    mockups: await readJsonDirectory(path.join(designSystemDirectory, 'mockups'), 'mockups'),
  };
  const errors = validateStudio(value);
  if (errors.length) throw new Error(errors.join('; '));
  return value;
}

async function syncEntityDirectory(directory, values) {
  await mkdir(directory, { recursive: true });
  const expected = new Map(values.map((value) => [fileNameForId(value.id), value]));
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all([...expected].map(([fileName, value]) => writeJsonAtomic(path.join(directory, fileName), value)));
  for (const entry of entries) if (entry.isFile() && entry.name.endsWith('.json') && !expected.has(entry.name)) await unlink(path.join(directory, entry.name));
}

export async function writeProjectStudio(designSystemDirectory, value) {
  const errors = validateStudio(value);
  if (errors.length) throw new Error(errors.join('; '));

  await writeJsonAtomic(path.join(designSystemDirectory, DESIGN_SYSTEM_MANIFEST), {
    schemaVersion: value.schemaVersion,
    meta: value.meta,
    settings: value.settings,
    adapterSettings: value.adapterSettings,
  });
  await writeJsonAtomic(path.join(designSystemDirectory, 'base-system', 'base-system.json'), value.baseSystem);
  await syncEntityDirectory(path.join(designSystemDirectory, 'tokens', 'themes'), value.tokens.themes);
  for (const category of tokenCategories) for (const tier of tokenTiers) await syncEntityDirectory(path.join(designSystemDirectory, 'tokens', category, tier), value.tokens[category][tier]);
  for (const [classification, directory] of Object.entries(componentDirectories)) await syncEntityDirectory(path.join(designSystemDirectory, 'components', directory), value.components.filter((item) => item.classification === classification));
  await syncEntityDirectory(path.join(designSystemDirectory, 'layouts'), value.layouts);
  await syncEntityDirectory(path.join(designSystemDirectory, 'screens'), value.screens);
  await syncEntityDirectory(path.join(designSystemDirectory, 'flows'), value.flows);
  await syncEntityDirectory(path.join(designSystemDirectory, 'mockups'), value.mockups);
}

export function projectEntityPath(designSystemDirectory, kind, entity) {
  if (kind === 'component') return path.join(designSystemDirectory, 'components', componentDirectories[entity.classification], fileNameForId(entity.id));
  if (kind === 'layout' || kind === 'screen' || kind === 'flow' || kind === 'mockup') return path.join(designSystemDirectory, `${kind}s`, fileNameForId(entity.id));
  throw new Error(`Unsupported project entity kind: ${kind}`);
}
