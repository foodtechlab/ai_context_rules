export function emptyStudio() {
  return {
    schemaVersion: 1,
    meta: {
      name: 'Untitled Design System',
      description: '',
      updatedAt: new Date(0).toISOString(),
    },
    themes: [
      {
        id: 'default',
        name: 'Default',
        tokens: {
          color: { background: '#ffffff', surface: '#f7f7f8', text: '#171719', primary: '#5b5bd6', border: '#dedee3' },
          typography: { family: 'Inter, sans-serif', bodySize: '16px', headingSize: '32px' },
          spacing: { sm: '8px', md: '16px', lg: '24px' },
          radius: { sm: '8px', md: '14px', pill: '999px' },
        },
      },
    ],
    components: [],
    screens: [],
    screenMaps: [],
    prototypes: [],
    adapterSettings: {
      packageName: 'design_system',
      webPrefix: 'ds',
    },
  };
}

export const CURRENT_SCHEMA_VERSION = 1;

const migrations = new Map([
  [0, (value) => ({
    ...value,
    schemaVersion: 1,
    meta: {
      name: value.meta?.name || 'Untitled Design System',
      description: value.meta?.description || '',
      updatedAt: value.meta?.updatedAt || new Date(0).toISOString(),
    },
    themes: value.themes || [],
    components: value.components || [],
    screens: value.screens || [],
    screenMaps: value.screenMaps || [],
    prototypes: value.prototypes || [],
    adapterSettings: value.adapterSettings || { packageName: 'design_system', webPrefix: 'ds' },
  })],
]);

export function migrateStudio(input) {
  if (!isObject(input)) return { value: input, migratedFrom: null };
  const migratedFrom = Number.isInteger(input.schemaVersion) ? input.schemaVersion : 0;
  if (migratedFrom > CURRENT_SCHEMA_VERSION) {
    throw new Error(`schemaVersion ${migratedFrom} is newer than supported version ${CURRENT_SCHEMA_VERSION}`);
  }

  let value = structuredClone(input);
  let version = migratedFrom;
  while (version < CURRENT_SCHEMA_VERSION) {
    const migration = migrations.get(version);
    if (!migration) throw new Error(`migration from schemaVersion ${version} is not available`);
    value = migration(value);
    version = value.schemaVersion;
  }
  return { value, migratedFrom: migratedFrom === CURRENT_SCHEMA_VERSION ? null : migratedFrom };
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function collectDuplicateIds(items, label, errors) {
  const ids = new Set();
  for (const [index, item] of items.entries()) {
    if (!isObject(item) || typeof item.id !== 'string' || !item.id) {
      errors.push(`${label}[${index}].id is required`);
      continue;
    }
    if (ids.has(item.id)) errors.push(`duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

export function validateStudio(value) {
  if (!isObject(value)) return ['root must be an object'];
  const errors = [];
  if (value.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
  if (!isObject(value.meta) || typeof value.meta.name !== 'string' || !value.meta.name) {
    errors.push('meta.name is required');
  }

  for (const key of ['themes', 'components', 'screens', 'screenMaps', 'prototypes']) {
    if (!Array.isArray(value[key])) errors.push(`${key} must be an array`);
  }
  if (errors.length) return errors;

  const themeIds = collectDuplicateIds(value.themes, 'themes', errors);
  const componentIds = collectDuplicateIds(value.components, 'components', errors);
  const screenIds = collectDuplicateIds(value.screens, 'screens', errors);
  const mapIds = collectDuplicateIds(value.screenMaps, 'screenMaps', errors);
  collectDuplicateIds(value.prototypes, 'prototypes', errors);

  for (const theme of value.themes) {
    if (!isObject(theme.tokens)) errors.push(`theme ${theme.id} tokens must be an object`);
  }
  if (!themeIds.size) errors.push('at least one theme is required');

  for (const component of value.components) {
    if (typeof component.name !== 'string' || !component.name) errors.push(`component ${component.id} name is required`);
    if (typeof component.kind !== 'string' || !component.kind) errors.push(`component ${component.id} kind is required`);
    if (!Array.isArray(component.variants)) errors.push(`component ${component.id} variants must be an array`);
    if (!Array.isArray(component.states)) errors.push(`component ${component.id} states must be an array`);
  }

  const screenStates = new Map();
  for (const screen of value.screens) {
    if (!Array.isArray(screen.states) || !screen.states.length) {
      errors.push(`screen ${screen.id} must contain states`);
      continue;
    }
    const stateIds = collectDuplicateIds(screen.states, `screen ${screen.id} states`, errors);
    screenStates.set(screen.id, stateIds);
    for (const state of screen.states) {
      if (!Array.isArray(state.blocks)) errors.push(`screen ${screen.id} state ${state.id} blocks must be an array`);
      for (const block of state.blocks || []) {
        if (!componentIds.has(block.componentId)) {
          errors.push(`screen ${screen.id} state ${state.id} references unknown component: ${block.componentId}`);
        }
      }
    }
  }

  const mapNodes = new Map();
  for (const map of value.screenMaps) {
    if (!Array.isArray(map.nodes) || !Array.isArray(map.edges)) {
      errors.push(`screenMap ${map.id} nodes and edges must be arrays`);
      continue;
    }
    const nodeIds = collectDuplicateIds(map.nodes, `screenMap ${map.id} nodes`, errors);
    mapNodes.set(map.id, nodeIds);
    for (const node of map.nodes) {
      if (!screenIds.has(node.screenId)) errors.push(`screenMap ${map.id} node ${node.id} references unknown screen: ${node.screenId}`);
      if (!screenStates.get(node.screenId)?.has(node.stateId)) {
        errors.push(`screenMap ${map.id} node ${node.id} references unknown state: ${node.stateId}`);
      }
      if (!isObject(node.position) || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`screenMap ${map.id} node ${node.id} position is invalid`);
      }
    }
    collectDuplicateIds(map.edges, `screenMap ${map.id} edges`, errors);
    for (const edge of map.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        errors.push(`screenMap ${map.id} edge ${edge.id} has unknown endpoint`);
      }
    }
    if (!nodeIds.has(map.startNodeId)) errors.push(`screenMap ${map.id} startNodeId is invalid`);
  }

  for (const prototype of value.prototypes) {
    if (!mapIds.has(prototype.mapId)) errors.push(`prototype ${prototype.id} references unknown map: ${prototype.mapId}`);
    if (!mapNodes.get(prototype.mapId)?.has(prototype.startNodeId)) {
      errors.push(`prototype ${prototype.id} startNodeId is invalid`);
    }
    if (!Array.isArray(prototype.fixtures)) errors.push(`prototype ${prototype.id} fixtures must be an array`);
  }

  return [...new Set(errors)];
}
