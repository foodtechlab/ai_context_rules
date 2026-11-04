export type TokenGroups = Record<string, Record<string, string>>;
export type TokenCategory = 'colors' | 'typography' | 'parameters';
export type TokenTier = 'base' | 'semantic' | 'component';

export interface ThemeMode { id: string; name: string }
export interface Theme { id: string; name: string; tokens: TokenGroups }
export interface DesignToken { id: string; name: string; value: string; purpose: string; modes?: Record<string, string> }
export interface TokenCategoryDefinition { base: DesignToken[]; semantic: DesignToken[]; component: DesignToken[] }

export interface BaseDesignSystem {
  name: string;
  version: string;
  platform: string;
  componentLibrary: string;
  inheritedPrinciples: string[];
  inheritedComponents: string[];
  inheritedBehaviors: string[];
  tokenOverrides: string[];
  changedComponents: string[];
  customComponents: string[];
  upgradeReviewNotes: string[];
  openQuestions: string[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  kind: 'button' | 'input' | 'card' | 'text' | 'badge';
  classification: 'atom' | 'molecule' | 'organism';
  description?: string;
  dependencies: string[];
  properties: string[];
  variants: string[];
  sizes: string[];
  states: string[];
  actions: string[];
  tokenRefs: string[];
  responsiveBehavior: string;
  accessibility?: { role?: string; label?: string };
  usage: string;
  restrictions: string[];
  defaultProps?: Record<string, unknown>;
  platforms?: string[];
}

export interface LayoutDefinition {
  id: string;
  name: string;
  purpose: string;
  regions: Array<{ id: string; name: string; required: boolean }>;
  navigationComponentIds: string[];
  tokenRefs: string[];
  widthRules: string;
  scrollRules: string;
  safeAreaRules: string;
  responsiveBehavior: string;
  openQuestions: string[];
}

export interface ScreenBlock { id: string; componentId: string; regionId?: string; variant?: string; state?: string; props?: Record<string, unknown>; actionId?: string }
export interface ScreenState { id: string; name: string; title?: string; description?: string; blocks: ScreenBlock[] }
export interface ScreenDefinition {
  id: string;
  name: string;
  purpose: string;
  userTask: string;
  layoutId: string;
  description?: string;
  inputParameters: string[];
  displayedData: string[];
  actions: string[];
  entryPoints: string[];
  returnBehavior: string;
  adaptiveNotes: string;
  viewports: string[];
  states: ScreenState[];
  openQuestions: string[];
}

export interface FlowNode { id: string; screenId: string; stateId: string; viewport: string; position: { x: number; y: number } }
export interface FlowTransition { id: string; source: string; target: string; actionId: string; label?: string; condition?: string }
export interface FlowDefinition {
  id: string;
  name: string;
  goal: string;
  startConditions: string[];
  entryNodeId: string;
  nodes: FlowNode[];
  transitions: FlowTransition[];
  happyPath: string[];
  alternativePaths: string[];
  recovery: string[];
  exitRules: string[];
  completionConditions: string[];
  openQuestions: string[];
}

export interface MockupFixture { id: string; name: string; state: Record<string, unknown> }
export interface MockupDefinition {
  id: string;
  name: string;
  flowId: string;
  startNodeId: string;
  fixtures: MockupFixture[];
  implementedInteractions: string[];
  simulatedInteractions: string[];
  supportedThemes: string[];
  supportedViewports: string[];
  openQuestions: string[];
}

export interface ViewportPreset { id: string; name: string; width: number; height: number; group?: 'mobile' | 'desktop'; purpose?: string }
export interface StudioSettings { defaultViewportId: string; viewportPresets: ViewportPreset[] }

export interface StudioData {
  schemaVersion: 1;
  meta: { name: string; description: string; updatedAt: string };
  settings?: StudioSettings;
  baseSystem: BaseDesignSystem;
  tokens: { themes: ThemeMode[]; colors: TokenCategoryDefinition; typography: TokenCategoryDefinition; parameters: TokenCategoryDefinition };
  components: ComponentDefinition[];
  layouts: LayoutDefinition[];
  screens: ScreenDefinition[];
  flows: FlowDefinition[];
  mockups: MockupDefinition[];
  adapterSettings: { packageName: string; webPrefix: string };
}

export type ScreenMapNode = FlowNode;
export type ScreenMapDefinition = FlowDefinition;

function allTokens(studio: StudioData) {
  return (['colors', 'typography', 'parameters'] as TokenCategory[]).flatMap((category) =>
    (['base', 'semantic', 'component'] as TokenTier[]).flatMap((tier) => studio.tokens[category][tier]),
  );
}

export function resolveTheme(studio: StudioData, themeId: string): Theme {
  const mode = studio.tokens.themes.find((item) => item.id === themeId) || studio.tokens.themes[0];
  const index = new Map(allTokens(studio).map((token) => [token.id, token]));
  const resolved = new Map<string, string>();
  const resolve = (id: string, stack = new Set<string>()): string => {
    if (resolved.has(id)) return resolved.get(id) as string;
    if (stack.has(id)) return `{${id}}`;
    const token = index.get(id);
    if (!token) return `{${id}}`;
    stack.add(id);
    const raw = token.modes?.[mode?.id] ?? token.value;
    const value = raw.replace(/\{([^}]+)\}/g, (_match, reference: string) => resolve(reference, stack));
    stack.delete(id);
    resolved.set(id, value);
    return value;
  };
  const groups: TokenGroups = {};
  for (const token of index.values()) {
    const [group, ...rest] = token.id.split('.');
    if (!groups[group]) groups[group] = {};
    groups[group][rest.join('.')] = resolve(token.id);
  }
  return { id: mode?.id || 'default', name: mode?.name || 'Default', tokens: groups };
}

export const VIEWPORTS: Record<string, ViewportPreset> = {
  phone: { id: 'phone', name: 'Phone', width: 390, height: 844 },
  tablet: { id: 'tablet', name: 'Tablet', width: 768, height: 1024 },
  desktop: { id: 'desktop', name: 'Desktop', width: 1280, height: 800 },
};

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  defaultViewportId: 'iphone-13-14',
  viewportPresets: [
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
  ],
};

export function getStudioSettings(studio: StudioData): StudioSettings {
  return studio.settings || DEFAULT_STUDIO_SETTINGS;
}

export function resolveViewport(studio: StudioData, viewportId: string): ViewportPreset {
  const settings = getStudioSettings(studio);
  return settings.viewportPresets.find((item) => item.id === viewportId)
    || VIEWPORTS[viewportId]
    || settings.viewportPresets.find((item) => item.id === settings.defaultViewportId)
    || VIEWPORTS.desktop;
}
