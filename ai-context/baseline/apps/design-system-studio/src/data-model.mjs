export const CURRENT_SCHEMA_VERSION = 1;
const tokenCategories = ['colors', 'typography', 'parameters'];
const tokenTiers = ['base', 'semantic', 'component'];
const legacyViewportIds = ['phone', 'tablet', 'desktop'];
const portableId = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export const defaultViewportPresets = [
  { id: 'iphone-se-2-3', name: 'iPhone SE, 2/3 поколения', width: 375, height: 667, group: 'mobile', purpose: 'Небольшой экран с малой высотой' },
  { id: 'iphone-13-14', name: 'iPhone 13 / 14', width: 390, height: 844, group: 'mobile', purpose: 'Базовый iPhone' },
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', width: 402, height: 874, group: 'mobile', purpose: 'Более широкий iPhone' },
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', width: 440, height: 956, group: 'mobile', purpose: 'Большой iPhone' },
  { id: 'android-compact', name: 'Android Compact', width: 360, height: 800, group: 'mobile', purpose: 'Узкий Android' },
  { id: 'android-standard', name: 'Android Standard', width: 393, height: 873, group: 'mobile', purpose: 'Средний Android' },
  { id: 'android-large', name: 'Android Large', width: 412, height: 915, group: 'mobile', purpose: 'Большой Android' },
  { id: 'laptop-small', name: 'Laptop Small', width: 1280, height: 720, group: 'desktop', purpose: 'Ограниченная высота окна' },
  { id: 'macbook-air-13', name: 'MacBook Air 13″ — профиль', width: 1470, height: 956, group: 'desktop', purpose: 'Средний ноутбук' },
  { id: 'macbook-air-15', name: 'MacBook Air 15″ — профиль', width: 1710, height: 1107, group: 'desktop', purpose: 'Большой Air' },
  { id: 'macbook-pro-14', name: 'MacBook Pro 14″ — профиль', width: 1512, height: 982, group: 'desktop', purpose: 'Средний Pro' },
  { id: 'macbook-pro-16', name: 'MacBook Pro 16″ — профиль', width: 1728, height: 1117, group: 'desktop', purpose: 'Большой Pro' },
  { id: 'desktop-full-hd', name: 'Desktop Full HD', width: 1920, height: 1080, group: 'desktop', purpose: 'Обычный монитор' },
  { id: 'desktop-qhd', name: 'Desktop QHD', width: 2560, height: 1440, group: 'desktop', purpose: 'Большая рабочая область' },
];

function blankTokenCategory() {
  return { base: [], semantic: [], component: [] };
}

export function emptyStudio() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    meta: { name: 'Untitled Design System', description: '', updatedAt: new Date(0).toISOString() },
    settings: {
      defaultViewportId: 'iphone-13-14',
      viewportPresets: structuredClone(defaultViewportPresets),
    },
    baseSystem: {
      name: 'Not selected', version: 'open', platform: 'open', componentLibrary: 'open',
      inheritedPrinciples: [], inheritedComponents: [], inheritedBehaviors: [], tokenOverrides: [],
      changedComponents: [], customComponents: [], upgradeReviewNotes: [],
      openQuestions: ['Choose the base design system and its version.'],
    },
    tokens: {
      themes: [{ id: 'default', name: 'Default' }],
      colors: blankTokenCategory(), typography: blankTokenCategory(), parameters: blankTokenCategory(),
    },
    components: [], layouts: [], screens: [], flows: [], mockups: [],
    adapterSettings: { packageName: 'design_system', webPrefix: 'ds' },
  };
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
    if (!portableId.test(item.id)) errors.push(`${label}[${index}].id must be portable as a filename: ${item.id}`);
    if (ids.has(item.id)) errors.push(`duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

export function validateStudio(value) {
  if (!isObject(value)) return ['root must be an object'];
  const errors = [];
  if (value.schemaVersion !== CURRENT_SCHEMA_VERSION) errors.push(`schemaVersion must equal ${CURRENT_SCHEMA_VERSION}`);
  if (!isObject(value.meta) || typeof value.meta.name !== 'string' || !value.meta.name) errors.push('meta.name is required');
  if (!isObject(value.baseSystem)) errors.push('baseSystem must be an object');
  if (!isObject(value.tokens)) errors.push('tokens must be an object');
  if (!isObject(value.settings)) errors.push('settings must be an object');
  if (!isObject(value.adapterSettings) || typeof value.adapterSettings.packageName !== 'string' || !value.adapterSettings.packageName || typeof value.adapterSettings.webPrefix !== 'string' || !value.adapterSettings.webPrefix) errors.push('adapterSettings packageName and webPrefix are required');
  for (const key of ['components', 'layouts', 'screens', 'flows', 'mockups']) if (!Array.isArray(value[key])) errors.push(`${key} must be an array`);
  if (errors.length) return errors;

  const configuredViewportIds = collectDuplicateIds(value.settings.viewportPresets || [], 'settings.viewportPresets', errors);
  const viewportIds = new Set([...configuredViewportIds, ...legacyViewportIds]);
  if (!configuredViewportIds.has(value.settings.defaultViewportId)) errors.push('settings.defaultViewportId references unknown viewport');
  for (const preset of value.settings.viewportPresets || []) {
    if (typeof preset.name !== 'string' || !preset.name) errors.push(`viewport ${preset.id || '?'} name is required`);
    if (!Number.isInteger(preset.width) || preset.width < 1 || !Number.isInteger(preset.height) || preset.height < 1) errors.push(`viewport ${preset.id || '?'} dimensions are invalid`);
    if (preset.group !== undefined && !['mobile', 'desktop'].includes(preset.group)) errors.push(`viewport ${preset.id || '?'} group is invalid`);
    if (preset.purpose !== undefined && (typeof preset.purpose !== 'string' || !preset.purpose)) errors.push(`viewport ${preset.id || '?'} purpose is invalid`);
  }

  const themeIds = collectDuplicateIds(value.tokens.themes || [], 'tokens.themes', errors);
  const tokenIds = new Set();
  for (const category of tokenCategories) {
    if (!isObject(value.tokens[category])) { errors.push(`tokens.${category} must be an object`); continue; }
    for (const tier of tokenTiers) {
      const items = value.tokens[category][tier];
      if (!Array.isArray(items)) { errors.push(`tokens.${category}.${tier} must be an array`); continue; }
      for (const token of items) {
        if (!token?.id) errors.push(`tokens.${category}.${tier} token id is required`);
        else if (!portableId.test(token.id)) errors.push(`token id must be portable as a filename: ${token.id}`);
        else if (tokenIds.has(token.id)) errors.push(`duplicate token id: ${token.id}`);
        else tokenIds.add(token.id);
        if (!token?.purpose) errors.push(`token ${token?.id || '?'} purpose is required`);
        for (const mode of Object.keys(token?.modes || {})) if (!themeIds.has(mode)) errors.push(`token ${token.id} references unknown theme: ${mode}`);
      }
    }
  }
  for (const category of tokenCategories) for (const tier of tokenTiers) for (const token of value.tokens[category]?.[tier] || []) {
    for (const reference of String(token.value).matchAll(/\{([^}]+)\}/g)) if (!tokenIds.has(reference[1])) errors.push(`token ${token.id} references unknown token: ${reference[1]}`);
  }

  const componentIds = collectDuplicateIds(value.components, 'components', errors);
  const layoutIds = collectDuplicateIds(value.layouts, 'layouts', errors);
  const screenIds = collectDuplicateIds(value.screens, 'screens', errors);
  const flowIds = collectDuplicateIds(value.flows, 'flows', errors);
  collectDuplicateIds(value.mockups, 'mockups', errors);
  for (const component of value.components) {
    if (!['atom', 'molecule', 'organism'].includes(component.classification)) errors.push(`component ${component.id} classification is invalid`);
    for (const dependency of component.dependencies || []) if (!componentIds.has(dependency)) errors.push(`component ${component.id} references unknown dependency: ${dependency}`);
    for (const tokenId of component.tokenRefs || []) if (!tokenIds.has(tokenId)) errors.push(`component ${component.id} references unknown token: ${tokenId}`);
  }
  const layoutRegions = new Map();
  for (const layout of value.layouts) {
    const regionIds = collectDuplicateIds(layout.regions || [], `layout ${layout.id} regions`, errors);
    layoutRegions.set(layout.id, regionIds);
    if (!regionIds.has('content')) errors.push(`layout ${layout.id} must define a content region for children`);
    for (const componentId of layout.navigationComponentIds || []) if (!componentIds.has(componentId)) errors.push(`layout ${layout.id} references unknown component: ${componentId}`);
    for (const tokenId of layout.tokenRefs || []) if (!tokenIds.has(tokenId)) errors.push(`layout ${layout.id} references unknown token: ${tokenId}`);
  }
  const screenStates = new Map();
  for (const screen of value.screens) {
    if (!layoutIds.has(screen.layoutId)) errors.push(`screen ${screen.id} references unknown layout: ${screen.layoutId}`);
    const states = collectDuplicateIds(screen.states || [], `screen ${screen.id} states`, errors);
    screenStates.set(screen.id, states);
    for (const viewport of screen.viewports || []) if (!viewportIds.has(viewport)) errors.push(`screen ${screen.id} references unknown viewport: ${viewport}`);
    for (const state of screen.states || []) for (const block of state.blocks || []) {
      if (!componentIds.has(block.componentId)) errors.push(`screen ${screen.id} references unknown component: ${block.componentId}`);
      if (block.regionId && !layoutRegions.get(screen.layoutId)?.has(block.regionId)) errors.push(`screen ${screen.id} block ${block.id} references unknown layout region: ${block.regionId}`);
    }
  }
  const flowNodes = new Map();
  for (const flow of value.flows) {
    const nodes = collectDuplicateIds(flow.nodes || [], `flow ${flow.id} nodes`, errors);
    flowNodes.set(flow.id, nodes);
    if (!nodes.has(flow.entryNodeId)) errors.push(`flow ${flow.id} entryNodeId is invalid`);
    for (const node of flow.nodes || []) {
      if (!screenIds.has(node.screenId)) errors.push(`flow ${flow.id} node ${node.id} references unknown screen`);
      if (!screenStates.get(node.screenId)?.has(node.stateId)) errors.push(`flow ${flow.id} node ${node.id} references unknown state`);
      if (!viewportIds.has(node.viewport)) errors.push(`flow ${flow.id} node ${node.id} references unknown viewport: ${node.viewport}`);
      if (!isObject(node.position) || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') errors.push(`flow ${flow.id} node ${node.id} position is invalid`);
    }
    collectDuplicateIds(flow.transitions || [], `flow ${flow.id} transitions`, errors);
    for (const transition of flow.transitions || []) if (!nodes.has(transition.source) || !nodes.has(transition.target)) errors.push(`flow ${flow.id} transition ${transition.id} has unknown endpoint`);
  }
  for (const mockup of value.mockups) {
    if (!flowIds.has(mockup.flowId)) errors.push(`mockup ${mockup.id} references unknown flow`);
    if (!flowNodes.get(mockup.flowId)?.has(mockup.startNodeId)) errors.push(`mockup ${mockup.id} startNodeId is invalid`);
    if (!Array.isArray(mockup.fixtures) || !mockup.fixtures.length) errors.push(`mockup ${mockup.id} fixtures are required`);
    for (const viewport of mockup.supportedViewports || []) if (!viewportIds.has(viewport)) errors.push(`mockup ${mockup.id} references unknown viewport: ${viewport}`);
  }
  return [...new Set(errors)];
}
