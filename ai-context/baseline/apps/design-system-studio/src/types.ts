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

export interface StudioData {
  schemaVersion: 1;
  meta: { name: string; description: string; updatedAt: string };
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

export const VIEWPORTS: Record<string, { name: string; width: number; height: number }> = {
  phone: { name: 'Phone', width: 390, height: 844 },
  tablet: { name: 'Tablet', width: 768, height: 1024 },
  desktop: { name: 'Desktop', width: 1280, height: 800 },
};
