export type TokenGroups = Record<string, Record<string, string>>;

export interface Theme {
  id: string;
  name: string;
  tokens: TokenGroups;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  kind: 'button' | 'input' | 'card' | 'text' | 'badge';
  description?: string;
  variants: string[];
  states: string[];
  defaultProps?: Record<string, unknown>;
  accessibility?: { role?: string; label?: string };
  platforms?: string[];
}

export interface ScreenBlock {
  id: string;
  componentId: string;
  variant?: string;
  state?: string;
  props?: Record<string, unknown>;
  actionId?: string;
}

export interface ScreenState {
  id: string;
  name: string;
  title?: string;
  description?: string;
  blocks: ScreenBlock[];
}

export interface ScreenDefinition {
  id: string;
  name: string;
  description?: string;
  viewports: string[];
  states: ScreenState[];
}

export interface ScreenMapNode {
  id: string;
  screenId: string;
  stateId: string;
  viewport: string;
  position: { x: number; y: number };
}

export interface ScreenMapEdge {
  id: string;
  source: string;
  target: string;
  actionId: string;
  label?: string;
}

export interface ScreenMapDefinition {
  id: string;
  name: string;
  startNodeId: string;
  nodes: ScreenMapNode[];
  edges: ScreenMapEdge[];
}

export interface PrototypeFixture {
  id: string;
  name: string;
  state: Record<string, unknown>;
}

export interface PrototypeDefinition {
  id: string;
  name: string;
  mapId: string;
  startNodeId: string;
  fixtures: PrototypeFixture[];
}

export interface StudioData {
  schemaVersion: 1;
  meta: { name: string; description: string; updatedAt: string };
  themes: Theme[];
  components: ComponentDefinition[];
  screens: ScreenDefinition[];
  screenMaps: ScreenMapDefinition[];
  prototypes: PrototypeDefinition[];
  adapterSettings: { packageName: string; webPrefix: string };
}

export type ViewportId = 'phone' | 'tablet' | 'desktop';

export const VIEWPORTS: Record<string, { name: string; width: number; height: number }> = {
  phone: { name: 'Phone', width: 390, height: 844 },
  tablet: { name: 'Tablet', width: 768, height: 1024 },
  desktop: { name: 'Desktop', width: 1280, height: 800 },
};
