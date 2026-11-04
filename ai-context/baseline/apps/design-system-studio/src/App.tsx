import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Edge, type Node } from '@xyflow/react';

import { CAPABILITIES, exportStudio, type Platform } from './adapters';
import PreviewErrorBoundary from './PreviewErrorBoundary';
import { ComponentPreview, ScreenMapNodeView, ScreenPreview } from './renderers';
import { DEFAULT_STUDIO_SETTINGS, getStudioSettings, resolveTheme, resolveViewport, type FlowDefinition, type StudioData, type Theme, type TokenCategory, type TokenTier, type ViewportPreset } from './types';

type Mode = 'base' | 'tokens' | 'components' | 'layouts' | 'screens' | 'flows' | 'mockup' | 'settings';
type ZoomableMode = 'components' | 'layouts' | 'screens';
type FlowNode = Node<{ node: FlowDefinition['nodes'][number]; studio: StudioData; theme: Theme }, 'screen'>;
type ProjectContext = { repositoryRoot: string; designSystemDirectory: string; designSystemManifestPath: string };
const NODE_TYPES = { screen: ScreenMapNodeView };
const NAVIGATION: Array<[Mode, string, string]> = [
  ['base', 'Базовая система', '◉'], ['tokens', 'Токены', '◫'], ['components', 'Компоненты', '◇'],
  ['layouts', 'Лейауты', '▤'], ['screens', 'Экраны', '▣'], ['flows', 'Flow', '⌘'], ['mockup', 'Mockup', '▶'], ['settings', 'Настройки', '⚙'],
];
const TOKEN_GROUPS: Array<[TokenCategory, string]> = [['colors', 'Цвета'], ['typography', 'Типографика'], ['parameters', 'Остальные параметры']];
const TOKEN_TIERS: Array<[TokenTier, string]> = [['base', 'Базовые'], ['semantic', 'Семантические'], ['component', 'Компонентные']];
type TokenPage = 'colors' | 'fonts' | 'typography' | 'parameters';
const TOKEN_PAGES: Array<[TokenPage, string]> = [['colors', 'Цвета'], ['fonts', 'Шрифты'], ['typography', 'Типографика'], ['parameters', 'Параметры']];
const INITIAL_ROUTE = window.location.hash.replace(/^#\/?/, '').split('/');
const normalizeZoom = (value: unknown) => Math.min(160, Math.max(40, Number(value) || 100));
const normalizeMockupZoom = (value: unknown) => Math.min(150, Math.max(10, Number(value) || 60));

function initialMode(): Mode {
  const candidate = INITIAL_ROUTE[0] as Mode;
  return NAVIGATION.some(([mode]) => mode === candidate) ? candidate : 'base';
}
function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}
function componentDefinitionPath(directory: string, component: StudioData['components'][number]) {
  const group = component.classification === 'atom' ? 'atoms' : component.classification === 'molecule' ? 'molecules' : 'organisms';
  return `${directory}/components/${group}/${component.id}.json`;
}
function List({ title, items }: { title: string; items: string[] }) {
  return <div className="definition-list"><strong>{title}</strong>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <span className="gap-marker">Нужно определить</span>}</div>;
}
function Questions({ items }: { items: string[] }) {
  if (!items.length) return null;
  return <div className="open-questions"><strong>Открытые вопросы</strong>{items.map((item) => <span key={item}>{item}</span>)}</div>;
}
type ProjectTreeNode = { id: string; label: string; tone?: string; count?: number; active?: boolean; children?: ProjectTreeNode[]; onSelect?: () => void };
function ProjectTreeItem({ node, level, expandedIds, onToggle }: { node: ProjectTreeNode; level: number; expandedIds: Set<string>; onToggle: (id: string) => void }) {
  const isFolder = Boolean(node.children);
  const isExpanded = isFolder && expandedIds.has(node.id);
  const select = () => { if (isFolder) onToggle(node.id); node.onSelect?.(); };
  return <div className="file-tree__item" role="treeitem" aria-expanded={isFolder ? isExpanded : undefined} aria-selected={node.active || undefined}>
    <button className={`file-tree__row ${node.active ? 'is-active' : ''}`} data-level={level} onClick={select} title={node.label}>
      <span className={`file-tree__chevron ${isExpanded ? 'is-expanded' : ''}`} aria-hidden="true">{isFolder ? '›' : ''}</span>
      <span className={`file-tree__icon ${isFolder ? 'is-folder' : 'is-file'} tone-${node.tone || 'default'}`} aria-hidden="true" />
      <span className="file-tree__label">{node.label}</span>
      {node.count !== undefined && <span className="file-tree__meta">{node.count}</span>}
    </button>
    {isFolder && isExpanded && <div className="file-tree__group" role="group">{node.children?.map((child) => <ProjectTreeItem key={child.id} node={child} level={level + 1} expandedIds={expandedIds} onToggle={onToggle} />)}</div>}
  </div>;
}
function ZoomControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const update = (next: number) => onChange(normalizeZoom(next));
  return <div className="zoom-control" aria-label="Масштаб рабочей области">
    <button type="button" onClick={() => update(value - 10)} disabled={value <= 40} aria-label="Уменьшить масштаб">−</button>
    <input type="range" min="40" max="160" step="10" value={value} onChange={(event) => update(Number(event.target.value))} aria-label="Масштаб рабочей области" />
    <button type="button" onClick={() => update(value + 10)} disabled={value >= 160} aria-label="Увеличить масштаб">+</button>
    <button className="zoom-control__value" type="button" onClick={() => onChange(100)} title="Сбросить до 100%"><output>{value}%</output></button>
  </div>;
}

function ViewportOptions({ presets }: { presets: ViewportPreset[] }) {
  const groups: Array<[ViewportPreset['group'], string]> = [['mobile', 'Mobile'], ['desktop', 'Desktop']];
  const groupedIds = new Set(presets.filter((preset) => preset.group).map((preset) => preset.id));
  return <>{groups.map(([group, label]) => {
    const items = presets.filter((preset) => preset.group === group);
    return items.length ? <optgroup key={group} label={label}>{items.map((preset) => <option key={preset.id} value={preset.id}>{preset.name} · {preset.width}×{preset.height}</option>)}</optgroup> : null;
  })}{presets.filter((preset) => !groupedIds.has(preset.id)).map((preset) => <option key={preset.id} value={preset.id}>{preset.name} · {preset.width}×{preset.height}</option>)}</>;
}

function typographyPreviewStyle(tokenId: string, value: string, defaultFamily: string): CSSProperties {
  const style: CSSProperties = { fontFamily: defaultFamily, fontSize: '28px', lineHeight: 1.25 };
  const shorthand = value.match(/^(\d+)\s+([\d.]+(?:px|rem|em))(?:\/([\d.]+))?\s+(.+)$/);
  if (shorthand) return { fontWeight: Number(shorthand[1]), fontSize: shorthand[2], lineHeight: shorthand[3] || 1.25, fontFamily: shorthand[4] };
  if (tokenId.includes('family')) style.fontFamily = value;
  else if (tokenId.includes('weight')) style.fontWeight = Number(value) || value;
  else if (tokenId.toLowerCase().includes('lineheight')) style.lineHeight = value;
  else if (/^[\d.]+(?:px|rem|em)$/.test(value)) style.fontSize = value;
  return style;
}

function tokensForPage(studio: StudioData, page: TokenPage, tier: TokenTier) {
  if (page === 'colors' || page === 'parameters') return studio.tokens[page][tier];
  const typographyTokens = studio.tokens.typography[tier];
  return typographyTokens.filter((token) => {
    const isFontFoundation = token.id.includes('.family') || token.id.includes('.weight');
    return page === 'fonts' ? isFontFoundation : !isFontFoundation;
  });
}

export default function App() {
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [themeId, setThemeId] = useState('');
  const [screenId, setScreenId] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[1] || '' : '');
  const [stateId, setStateId] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[2] || '' : '');
  const [viewport, setViewport] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[3] || '' : '');
  const [flowId, setFlowId] = useState(INITIAL_ROUTE[0] === 'flows' ? INITIAL_ROUTE[1] || '' : '');
  const [mockupId, setMockupId] = useState(INITIAL_ROUTE[0] === 'mockup' ? INITIAL_ROUTE[1] || '' : '');
  const [fixtureId, setFixtureId] = useState(INITIAL_ROUTE[0] === 'mockup' ? INITIAL_ROUTE[3] || '' : '');
  const [mockupNodeId, setMockupNodeId] = useState(INITIAL_ROUTE[0] === 'mockup' ? INITIAL_ROUTE[2] || '' : '');
  const [mockupViewport, setMockupViewport] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [message, setMessage] = useState('Загрузка дизайн-системы…');
  const [isSaving, setIsSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeStructureId, setActiveStructureId] = useState(INITIAL_ROUTE[1] || '');
  const [navigationCollapsed, setNavigationCollapsed] = useState(() => window.localStorage.getItem('aic:design-studio:navigation-collapsed') === 'true');
  const [inspectorCollapsed, setInspectorCollapsed] = useState(() => window.localStorage.getItem('aic:design-studio:inspector-collapsed') === 'true');
  const [expandedTreeIds, setExpandedTreeIds] = useState<Set<string>>(() => {
    try { const stored = JSON.parse(window.localStorage.getItem('aic:design-studio:expanded-tree') || '[]'); return new Set(['project-root', 'components', 'components-atom', initialMode(), ...(Array.isArray(stored) ? stored : [])]); }
    catch { return new Set(['project-root', 'components', 'components-atom', initialMode()]); }
  });
  const [zoomLevels, setZoomLevels] = useState<Record<ZoomableMode, number>>(() => {
    try { const stored = JSON.parse(window.localStorage.getItem('aic:design-studio:zoom-levels') || '{}'); return { components: normalizeZoom(stored.components), layouts: normalizeZoom(stored.layouts), screens: normalizeZoom(stored.screens) }; }
    catch { return { components: 100, layouts: 100, screens: 100 }; }
  });
  const [editorValue, setEditorValue] = useState('');
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [promptComponentId, setPromptComponentId] = useState('');
  const [typographySample, setTypographySample] = useState(() => window.localStorage.getItem('aic:design-studio:typography-sample') || 'Съешь ещё этих мягких французских булок, да выпей чаю');
  const [mockupZoom, setMockupZoom] = useState(() => normalizeMockupZoom(window.localStorage.getItem('aic:design-studio:mockup-zoom')));
  const [mockupTool, setMockupTool] = useState<'pointer' | 'hand'>('pointer');
  const [isPanningMockup, setIsPanningMockup] = useState(false);
  const mockupCanvasRef = useRef<HTMLDivElement>(null);
  const mockupPanOrigin = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const loadStudio = useCallback(async (notify = false) => {
    setMessage(notify ? 'Перечитываю данные…' : 'Загрузка дизайн-системы…');
    try {
      const response = await fetch('/api/studio'); const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Не удалось загрузить дизайн-систему');
      setStudio(payload); setEditorValue(JSON.stringify(payload, null, 2));
      setThemeId((current) => current || payload.tokens.themes[0]?.id || '');
      setScreenId((current) => current || payload.screens[0]?.id || '');
      setFlowId((current) => current || payload.flows[0]?.id || '');
      setMockupId((current) => current || payload.mockups[0]?.id || '');
      setMessage(notify ? 'Данные перечитаны' : '');
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
  }, []);
  useEffect(() => { loadStudio(); }, [loadStudio]);
  useEffect(() => {
    fetch('/api/project-context').then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Не удалось определить локальный путь дизайн-системы');
      setProjectContext(payload);
    }).catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, []);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:navigation-collapsed', String(navigationCollapsed)); }, [navigationCollapsed]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:inspector-collapsed', String(inspectorCollapsed)); }, [inspectorCollapsed]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:expanded-tree', JSON.stringify([...expandedTreeIds])); }, [expandedTreeIds]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:zoom-levels', JSON.stringify(zoomLevels)); }, [zoomLevels]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:mockup-zoom', String(mockupZoom)); }, [mockupZoom]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:typography-sample', typographySample); }, [typographySample]);

  const saveStudio = useCallback(async (next: StudioData, success = 'Изменения сохранены локально') => {
    setIsSaving(true); setMessage('Сохраняю…');
    try {
      const response = await fetch('/api/studio', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Не удалось сохранить дизайн-систему');
      setStudio(payload.studio); setEditorValue(JSON.stringify(payload.studio, null, 2)); setMessage(success); return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); return false; }
    finally { setIsSaving(false); }
  }, []);

  const theme = useMemo(() => studio ? resolveTheme(studio, themeId) : null, [studio, themeId]);
  const studioSettings = useMemo(() => studio ? getStudioSettings(studio) : DEFAULT_STUDIO_SETTINGS, [studio]);
  const screen = useMemo(() => studio?.screens.find((item) => item.id === screenId) || studio?.screens[0], [studio, screenId]);
  const flow = useMemo(() => studio?.flows.find((item) => item.id === flowId) || studio?.flows[0], [studio, flowId]);
  const mockup = useMemo(() => studio?.mockups.find((item) => item.id === mockupId) || studio?.mockups[0], [studio, mockupId]);
  const activeTokenPage = useMemo<TokenPage>(() => {
    const candidate = activeStructureId.replace(/^tokens-/, '') as TokenPage;
    return TOKEN_PAGES.some(([page]) => page === candidate) ? candidate : 'colors';
  }, [activeStructureId]);
  const activeComponent = useMemo(() => studio?.components.find((item) => activeStructureId === `component-${item.id}`), [activeStructureId, studio]);
  const promptComponent = useMemo(() => studio?.components.find((item) => item.id === promptComponentId) || studio?.components[0], [studio, promptComponentId]);
  const promptComponentPath = promptComponent && projectContext ? componentDefinitionPath(projectContext.designSystemDirectory, promptComponent) : '';
  const implementationPrompt = promptComponent && projectContext
    ? `я хочу что бы ты реализовал компонент по дизайн системе - ${promptComponentPath}`
    : '';

  useEffect(() => {
    if (!studio) return;
    let route = `#/${mode}`;
    if ((mode === 'components' || mode === 'tokens') && activeStructureId) route += `/${activeStructureId}`;
    if (mode === 'screens' && screenId && stateId) route += `/${screenId}/${stateId}/${viewport}`;
    if (mode === 'flows' && flowId) route += `/${flowId}`;
    if (mode === 'mockup' && mockupId && mockupNodeId) route += `/${mockupId}/${mockupNodeId}/${fixtureId}`;
    window.history.replaceState(null, '', route);
  }, [studio, mode, activeStructureId, screenId, stateId, viewport, flowId, mockupId, mockupNodeId, fixtureId]);
  useEffect(() => {
    if (!screen) return;
    if (!screen.states.some((item) => item.id === stateId)) setStateId(screen.states[0]?.id || '');
    if (!studioSettings.viewportPresets.some((item) => item.id === viewport)) setViewport(studioSettings.defaultViewportId);
  }, [screen, stateId, viewport, studioSettings]);
  useEffect(() => {
    if (!studio || !flow || !theme) { setNodes([]); setEdges([]); return; }
    setNodes(flow.nodes.map((node) => ({ id: node.id, type: 'screen', position: node.position, data: { node, studio, theme } })));
    setEdges(flow.transitions.map((edge) => ({ ...edge, label: edge.condition ? `${edge.label || edge.actionId} · ${edge.condition}` : edge.label || edge.actionId, type: 'smoothstep', animated: true })));
  }, [studio, flow, theme, setNodes, setEdges]);
  useEffect(() => {
    if (!mockup || !studio) return;
    const fixture = mockup.fixtures.find((item) => item.id === fixtureId) || mockup.fixtures[0];
    if (fixture && fixture.id !== fixtureId) setFixtureId(fixture.id);
    const selectedFlow = studio.flows.find((item) => item.id === mockup.flowId);
    if (!studioSettings.viewportPresets.some((item) => item.id === mockupViewport)) setMockupViewport(studioSettings.defaultViewportId);
    if (!mockupNodeId || !selectedFlow?.nodes.some((item) => item.id === mockupNodeId)) { setMockupNodeId(mockup.startNodeId); setHistory([]); }
  }, [mockup, studio, fixtureId, mockupNodeId, mockupViewport, studioSettings]);
  useEffect(() => {
    const activeItems = document.querySelectorAll<HTMLElement>('.project-tree button.is-active');
    activeItems.item(activeItems.length - 1)?.scrollIntoView({ block: 'nearest' });
    if (mode === 'components' && activeStructureId.startsWith('components-')) window.requestAnimationFrame(() => document.getElementById(activeStructureId)?.scrollIntoView({ block: 'start' }));
  }, [mode, activeStructureId, screenId, flowId, mockupId]);
  useEffect(() => {
    const selected = studio?.components.find((item) => activeStructureId === `component-${item.id}`);
    if (selected) setPromptComponentId(selected.id);
    else if (!promptComponentId && studio?.components[0]) setPromptComponentId(studio.components[0].id);
  }, [activeStructureId, promptComponentId, studio]);

  if (!studio || !theme) return <main className="loading-screen"><span className="spinner" />{message}</main>;

  const saveJson = async () => {
    try { const parsed = JSON.parse(editorValue) as StudioData; if (await saveStudio(parsed, 'JSON сохранён локально')) setEditorOpen(false); }
    catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
  };
  const updateToken = async (category: TokenCategory, tier: TokenTier, tokenId: string, value: string) => {
    const next = structuredClone(studio);
    const token = next.tokens[category][tier].find((item) => item.id === tokenId); if (!token) return;
    if (theme.id === next.tokens.themes[0]?.id) token.value = value; else token.modes = { ...token.modes, [theme.id]: value };
    await saveStudio(next, `Токен ${tokenId} сохранён для темы ${theme.name}`);
  };
  const updateDefaultViewport = async (defaultViewportId: string) => {
    const next = structuredClone(studio); next.settings = structuredClone(next.settings || DEFAULT_STUDIO_SETTINGS);
    next.settings.defaultViewportId = defaultViewportId;
    if (await saveStudio(next, `Разрешение ${defaultViewportId} выбрано по умолчанию`)) { setViewport(defaultViewportId); setMockupViewport(defaultViewportId); }
  };
  const updateViewportPreset = async (viewportId: string, patch: Partial<ViewportPreset>) => {
    const next = structuredClone(studio); next.settings = structuredClone(next.settings || DEFAULT_STUDIO_SETTINGS);
    next.settings.viewportPresets = next.settings.viewportPresets.map((item) => item.id === viewportId ? { ...item, ...patch } : item);
    await saveStudio(next, `Настройки ${viewportId} сохранены`);
  };
  const saveFlowPosition = async (draggedNode: FlowNode) => {
    if (!flow) return;
    const next = { ...studio, flows: studio.flows.map((item) => item.id === flow.id ? { ...item, nodes: item.nodes.map((node) => node.id === draggedNode.id ? { ...node, position: draggedNode.position } : node) } : item) };
    await saveStudio(next, 'Положение экрана во flow сохранено');
  };
  const activeFlow = studio.flows.find((item) => item.id === mockup?.flowId);
  const activeNode = activeFlow?.nodes.find((item) => item.id === mockupNodeId);
  const activeScreen = studio.screens.find((item) => item.id === activeNode?.screenId);
  const activeFixture = mockup?.fixtures.find((item) => item.id === fixtureId) || mockup?.fixtures[0];
  const activeViewportPreset = resolveViewport(studio, mockupViewport);
  const resetMockup = () => { if (mockup) { setMockupNodeId(mockup.startNodeId); setHistory([]); } };
  const fitMockup = () => {
    const canvas = mockupCanvasRef.current; if (!canvas) return;
    const widthScale = (canvas.clientWidth - 120) / activeViewportPreset.width;
    const heightScale = (canvas.clientHeight - 140) / activeViewportPreset.height;
    setMockupZoom(normalizeMockupZoom(Math.floor(Math.min(widthScale, heightScale, 1) * 100 / 5) * 5));
    window.requestAnimationFrame(() => { canvas.scrollTo({ left: Math.max(0, (canvas.scrollWidth - canvas.clientWidth) / 2), top: Math.max(0, (canvas.scrollHeight - canvas.clientHeight) / 2), behavior: 'smooth' }); });
  };
  const startMockupPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mockupTool !== 'hand' || !mockupCanvasRef.current) return;
    const canvas = mockupCanvasRef.current; mockupPanOrigin.current = { x: event.clientX, y: event.clientY, left: canvas.scrollLeft, top: canvas.scrollTop };
    setIsPanningMockup(true); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveMockupPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningMockup || !mockupCanvasRef.current) return;
    mockupCanvasRef.current.scrollLeft = mockupPanOrigin.current.left - (event.clientX - mockupPanOrigin.current.x);
    mockupCanvasRef.current.scrollTop = mockupPanOrigin.current.top - (event.clientY - mockupPanOrigin.current.y);
  };
  const performAction = (actionId: string) => {
    const transition = activeFlow?.transitions.find((item) => item.source === mockupNodeId && item.actionId === actionId);
    if (!transition) { setMessage(`Для действия «${actionId}» переход не задан`); return; }
    setHistory((items) => [...items, mockupNodeId]); setMockupNodeId(transition.target); setMessage(`Переход: ${transition.label || transition.actionId}`);
  };
  const openStructureItem = (nextMode: Mode, itemId = '') => {
    setMode(nextMode); setActiveStructureId(itemId);
    if (itemId) window.setTimeout(() => document.getElementById(itemId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };
  const toggleTreeNode = (id: string) => setExpandedTreeIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const zoomMode: ZoomableMode | null = mode === 'components' || mode === 'layouts' || mode === 'screens' ? mode : null;
  const updateZoom = (value: number) => { if (zoomMode) setZoomLevels((current) => ({ ...current, [zoomMode]: value })); };
  const projectTree: ProjectTreeNode = { id: 'project-root', label: 'design-system', tone: 'project', children: [
    { id: 'base', label: 'base-system', tone: 'base', active: mode === 'base', onSelect: () => openStructureItem('base') },
    { id: 'tokens', label: 'tokens', tone: 'tokens', count: TOKEN_GROUPS.reduce((total, [category]) => total + TOKEN_TIERS.reduce((subtotal, [tier]) => subtotal + studio.tokens[category][tier].length, 0), 0), active: mode === 'tokens' && !activeStructureId, onSelect: () => openStructureItem('tokens', 'tokens-colors'), children: TOKEN_PAGES.map(([page]) => ({ id: `tree-tokens-${page}`, label: page, tone: 'tokens', count: TOKEN_TIERS.reduce((total, [tier]) => total + tokensForPage(studio, page, tier).length, 0), active: mode === 'tokens' && activeTokenPage === page, onSelect: () => openStructureItem('tokens', `tokens-${page}`) })) },
    { id: 'components', label: 'components', tone: 'components', count: studio.components.length, active: mode === 'components' && !activeStructureId, onSelect: () => openStructureItem('components'), children: (['atom', 'molecule', 'organism'] as const).map((classification) => ({ id: `components-${classification}`, label: classification === 'atom' ? 'atoms' : classification === 'molecule' ? 'molecules' : 'organisms', tone: 'components', count: studio.components.filter((item) => item.classification === classification).length, active: mode === 'components' && activeStructureId === `components-${classification}`, onSelect: () => openStructureItem('components', `components-${classification}`), children: studio.components.filter((item) => item.classification === classification).map((component) => ({ id: `tree-component-${component.id}`, label: component.name, tone: 'component-file', active: mode === 'components' && activeStructureId === `component-${component.id}`, onSelect: () => openStructureItem('components', `component-${component.id}`) })) })) },
    { id: 'layouts', label: 'layouts', tone: 'layouts', count: studio.layouts.length, active: mode === 'layouts' && !activeStructureId, onSelect: () => openStructureItem('layouts'), children: studio.layouts.map((layout) => ({ id: `tree-layout-${layout.id}`, label: layout.name, tone: 'layout-file', active: mode === 'layouts' && activeStructureId === `layout-${layout.id}`, onSelect: () => openStructureItem('layouts', `layout-${layout.id}`) })) },
    { id: 'screens', label: 'screens', tone: 'screens', count: studio.screens.length, onSelect: () => setMode('screens'), children: studio.screens.map((item) => ({ id: `tree-screen-${item.id}`, label: item.name, tone: 'screen-file', count: item.states.length, active: mode === 'screens' && screen?.id === item.id, onSelect: () => { setMode('screens'); setScreenId(item.id); } })) },
    { id: 'flows', label: 'flows', tone: 'flows', count: studio.flows.length, onSelect: () => setMode('flows'), children: studio.flows.map((item) => ({ id: `tree-flow-${item.id}`, label: item.name, tone: 'flow-file', count: item.nodes.length, active: mode === 'flows' && flow?.id === item.id, onSelect: () => { setMode('flows'); setFlowId(item.id); } })) },
    { id: 'mockup', label: 'mockups', tone: 'mockups', count: studio.mockups.length, onSelect: () => setMode('mockup'), children: studio.mockups.map((item) => ({ id: `tree-mockup-${item.id}`, label: item.name, tone: 'mockup-file', count: item.fixtures.length, active: mode === 'mockup' && mockup?.id === item.id, onSelect: () => { setMode('mockup'); setMockupId(item.id); setMockupNodeId(''); } })) },
    { id: 'settings', label: 'settings', tone: 'settings', active: mode === 'settings', onSelect: () => setMode('settings') },
  ] };

  return <main className={`studio-shell ${navigationCollapsed ? 'is-navigation-collapsed' : ''} ${inspectorCollapsed ? 'is-inspector-collapsed' : ''}`}>
    <aside className="studio-sidebar" id="studio-project-navigation" aria-hidden={navigationCollapsed} inert={navigationCollapsed}>
      <div className="studio-brand"><span>AIC / PROJECT</span><h1>Design System<br />Studio</h1><p>{studio.meta.name}</p></div>
      <div className="project-tree__toolbar"><span>Explorer</span><button type="button" onClick={() => setExpandedTreeIds(new Set(['project-root']))} title="Свернуть все папки">Свернуть</button></div>
      <nav className="project-tree" aria-label="Структура проекта" role="tree"><ProjectTreeItem node={projectTree} level={0} expandedIds={expandedTreeIds} onToggle={toggleTreeNode} /></nav>
    </aside>
    <section className="studio-main">
      <header className="topbar"><div className="topbar__identity"><button className="panel-toggle" type="button" aria-expanded={!navigationCollapsed} aria-controls="studio-project-navigation" onClick={() => setNavigationCollapsed((current) => !current)} title={navigationCollapsed ? 'Показать меню навигации' : 'Скрыть меню навигации'}><i aria-hidden="true">{navigationCollapsed ? '→' : '←'}</i><span>{navigationCollapsed ? 'Показать меню' : 'Скрыть меню'}</span></button><div><span>DESIGN SYSTEM</span><strong>{NAVIGATION.find(([value]) => value === mode)?.[1]}</strong></div></div><div className="topbar__status"><div className="save-state"><i className={isSaving ? 'is-saving' : ''} />{message || 'Все изменения сохранены локально'}</div><button className="panel-toggle" type="button" aria-expanded={!inspectorCollapsed} aria-controls="studio-tools-panel" onClick={() => setInspectorCollapsed((current) => !current)} title={inspectorCollapsed ? 'Показать меню инструментов' : 'Скрыть меню инструментов'}><span>{inspectorCollapsed ? 'Показать инструменты' : 'Скрыть инструменты'}</span><i aria-hidden="true">{inspectorCollapsed ? '←' : '→'}</i></button></div></header>
      <div className="workspace">
        {mode === 'base' && <section className="panel-stack">
          <div className="section-heading"><div><span>01 / FOUNDATION</span><h2>Базовая дизайн-система</h2></div><p>Фундамент продукта и явный контракт отличий, которые нужно проверять при обновлении.</p></div>
          <article className="definition-card hero-card"><header><div><span>{studio.baseSystem.platform}</span><h3>{studio.baseSystem.name} · {studio.baseSystem.version}</h3><p>{studio.baseSystem.componentLibrary}</p></div></header>
            <div className="definition-grid"><List title="Наследуемые принципы" items={studio.baseSystem.inheritedPrinciples} /><List title="Наследуемые компоненты" items={studio.baseSystem.inheritedComponents} /><List title="Стандартные поведения" items={studio.baseSystem.inheritedBehaviors} /><List title="Переопределения токенов" items={studio.baseSystem.tokenOverrides} /><List title="Изменённые компоненты" items={studio.baseSystem.changedComponents} /><List title="Собственные компоненты" items={studio.baseSystem.customComponents} /><List title="Проверить при обновлении" items={studio.baseSystem.upgradeReviewNotes} /></div><Questions items={studio.baseSystem.openQuestions} />
          </article>
        </section>}
        {mode === 'tokens' && (() => { const pageLabel = TOKEN_PAGES.find(([page]) => page === activeTokenPage)?.[1] || activeTokenPage; const isTypePage = activeTokenPage === 'fonts' || activeTokenPage === 'typography'; const sourceCategory: TokenCategory = isTypePage ? 'typography' : activeTokenPage; const pageCount = TOKEN_TIERS.reduce((count, [tier]) => count + tokensForPage(studio, activeTokenPage, tier).length, 0); return <section className="panel-stack token-page">
          <div className="section-heading"><div><span>02 / TOKENS / {activeTokenPage.toUpperCase()}</span><h2>{pageLabel}</h2></div><p>{activeTokenPage === 'fonts' ? 'Семейства и начертания шрифтов. Один font token — одна строка.' : activeTokenPage === 'typography' ? 'Размеры, межстрочные интервалы и составные текстовые стили.' : 'Базовые → семантические → компонентные токены без смешивания с другими категориями.'}</p></div>
          <nav className="token-page-switcher" aria-label="Разделы токенов">{TOKEN_PAGES.map(([page, label]) => <button type="button" key={page} className={activeTokenPage === page ? 'is-active' : ''} onClick={() => openStructureItem('tokens', `tokens-${page}`)}>{label}<span>{TOKEN_TIERS.reduce((count, [tier]) => count + tokensForPage(studio, page, tier).length, 0)}</span></button>)}</nav>
          <article className={`token-group ${isTypePage ? 'is-typography' : ''}`} id={`tokens-${activeTokenPage}`}><header><h3>{pageLabel}</h3><span>{pageCount} tokens</span></header>
            {isTypePage && <label className="typography-sample"><span>Текст для проверки</span><input value={typographySample} onChange={(event) => setTypographySample(event.target.value)} placeholder="Введите текст для проверки шрифтов" /></label>}
            {TOKEN_TIERS.map(([tier, tierLabel]) => { const pageTokens = tokensForPage(studio, activeTokenPage, tier); if (!pageTokens.length) return null; return <div className="token-tier" key={tier}><div className="token-tier__title"><strong>{tierLabel}</strong><span>{pageTokens.length}</span></div>{isTypePage ? <div className="typography-list">{pageTokens.map((token) => { const resolved = theme.tokens.typography?.[token.id.split('.').slice(1).join('.')] || token.value; const family = theme.tokens.typography?.family || theme.tokens.typography?.['family.sans'] || "'DM Sans', sans-serif"; return <div className="typography-row" key={token.id}><div className="typography-row__meta"><strong>{token.name}</strong><code>{token.id}</code><small>{token.purpose}</small></div><div className="typography-row__preview" style={typographyPreviewStyle(token.id, resolved, family)}>{typographySample || 'Введите текст для проверки'}</div><label className="typography-row__value"><span>Значение</span><input key={`${token.id}:${theme.id}`} defaultValue={token.modes?.[theme.id] ?? token.value} onBlur={(event) => event.target.value !== (token.modes?.[theme.id] ?? token.value) && updateToken('typography', tier, token.id, event.target.value)} /></label></div>; })}</div> : <div className="token-grid">{pageTokens.map((token) => { const resolved = theme.tokens[token.id.split('.')[0]]?.[token.id.split('.').slice(1).join('.')] || token.value; return <label className="token-card" key={token.id}>{activeTokenPage === 'colors' && <i style={{ background: resolved }} />}<span>{token.id}</span><small>{token.purpose}</small><input key={`${token.id}:${theme.id}`} defaultValue={token.modes?.[theme.id] ?? token.value} onBlur={(event) => event.target.value !== (token.modes?.[theme.id] ?? token.value) && updateToken(sourceCategory, tier, token.id, event.target.value)} /></label>; })}</div>}</div>; })}
          </article>
        </section>; })()}
        {mode === 'components' && !activeComponent && <section className="panel-stack component-catalog">
          <div className="section-heading"><div><span>03 / COMPONENTS</span><h2>Атомы, молекулы и организмы</h2></div><p>Выберите компонент — его варианты и состояния откроются на отдельном рабочем экране.</p></div>
          {(['atom', 'molecule', 'organism'] as const).map((classification) => <section className="classification-section" id={`components-${classification}`} key={classification}><h3>{classification === 'atom' ? 'Атомы' : classification === 'molecule' ? 'Молекулы' : 'Организмы'}</h3><div className="component-catalog__grid">{studio.components.filter((item) => item.classification === classification).map((component) => <button type="button" className="component-catalog__item" key={component.id} onClick={() => openStructureItem('components', `component-${component.id}`)}><span>{component.classification}</span><strong>{component.name}</strong><p>{component.description || component.usage}</p><footer><code>{component.id}</code><i>{component.variants.length * component.states.length} frames →</i></footer></button>)}</div></section>)}
        </section>}
        {mode === 'components' && activeComponent && <section className="component-detail" id={`component-${activeComponent.id}`}>
          <header className="component-detail__toolbar"><div><button type="button" onClick={() => openStructureItem('components', `components-${activeComponent.classification}`)}>← {activeComponent.classification === 'atom' ? 'Атомы' : activeComponent.classification === 'molecule' ? 'Молекулы' : 'Организмы'}</button><i>/</i><strong>{activeComponent.name}</strong></div><div><code>{activeComponent.id}</code><span>{activeComponent.variants.length} variants · {activeComponent.states.length} states</span></div></header>
          <div className="component-canvas"><div className="component-canvas__surface" style={{ zoom: zoomLevels.components / 100 }}>{activeComponent.variants.flatMap((variant) => activeComponent.states.map((state) => <article className="component-frame" key={`${variant}:${state}`}><header><strong>{activeComponent.name}</strong><span>{variant} / {state}</span></header><div className="component-frame__preview"><ComponentPreview definition={activeComponent} variant={variant} state={state} /></div><footer><code>{activeComponent.id}</code><span>{activeComponent.classification}</span></footer></article>))}</div></div>
        </section>}
        {mode === 'layouts' && <section className="panel-stack zoomable-content" style={{ zoom: zoomLevels.layouts / 100 }}>
          <div className="section-heading"><div><span>04 / LAYOUTS</span><h2>Повторно используемые структуры</h2></div><p>Лейаут задаёт области, навигацию, сетку, прокрутку, safe areas и адаптацию.</p></div>
          {studio.layouts.map((layout) => <article className="definition-card" id={`layout-${layout.id}`} key={layout.id}><header><div><span>{layout.id}</span><h3>{layout.name}</h3><p>{layout.purpose}</p></div></header><div className="region-map">{layout.regions.map((region) => <div key={region.id} className={region.required ? 'is-required' : ''}><strong>{region.name}</strong><code>{region.id}</code><span>{region.required ? 'обязательный' : 'необязательный'}</span></div>)}</div><div className="definition-grid"><List title="Навигационные компоненты" items={layout.navigationComponentIds} /><List title="Токены" items={layout.tokenRefs} /><List title="Ширина и сетка" items={[layout.widthRules]} /><List title="Прокрутка" items={[layout.scrollRules]} /><List title="Safe area и клавиатура" items={[layout.safeAreaRules]} /><List title="Адаптация" items={[layout.responsiveBehavior]} /></div><Questions items={layout.openQuestions} /></article>)}
        </section>}
        {mode === 'screens' && screen && <section className="screen-workspace"><div className="preview-stage"><PreviewErrorBoundary><ScreenPreview studio={studio} screen={screen} stateId={stateId} viewport={viewport} theme={theme} zoom={zoomLevels.screens / 100} fixture={{ userName: 'Алекс', adminName: 'Анна', organizationName: 'Northstar', createdUserName: 'Мария Орлова', selectedUserName: 'Анна Смирнова', selectedUserEmail: 'anna@northstar.dev' }} /></PreviewErrorBoundary></div></section>}
        {mode === 'flows' && flow && <section className="map-workspace"><div className="map-toolbar"><strong>{flow.name}</strong><span>{flow.nodes.length} экранов · {flow.transitions.length} переходов</span></div><ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeDragStop={(_event, node) => saveFlowPosition(node)} fitView minZoom={0.15} maxZoom={1.4} nodesConnectable={false}><Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#313744" /><Controls position="bottom-right" /><MiniMap position="bottom-left" nodeColor="#a18cff" maskColor="rgba(10,12,18,.78)" /></ReactFlow></section>}
        {mode === 'mockup' && mockup && activeNode && activeScreen && <section className="mockup-editor">
          <header className="mockup-editor__toolbar"><div className="mockup-editor__identity"><span>PROTOTYPE</span><strong>{mockup.name}</strong><i>/</i><span>{activeScreen.name}</span></div><div className="mockup-editor__tools" role="group" aria-label="Инструменты canvas"><button type="button" className={mockupTool === 'pointer' ? 'is-active' : ''} onClick={() => setMockupTool('pointer')} title="Курсор — взаимодействовать с mockup">↖</button><button type="button" className={mockupTool === 'hand' ? 'is-active' : ''} onClick={() => setMockupTool('hand')} title="Рука — перемещать canvas">✋</button></div><div className="mockup-editor__actions"><span>{activeViewportPreset.width} × {activeViewportPreset.height}</span><button type="button" onClick={resetMockup}>▶ Перезапустить</button></div></header>
          <div ref={mockupCanvasRef} className={`mockup-canvas is-${mockupTool} ${isPanningMockup ? 'is-panning' : ''}`} onPointerDown={startMockupPan} onPointerMove={moveMockupPan} onPointerUp={() => setIsPanningMockup(false)} onPointerCancel={() => setIsPanningMockup(false)} onWheel={(event) => { if (event.ctrlKey || event.metaKey) { event.preventDefault(); setMockupZoom((current) => normalizeMockupZoom(current - event.deltaY * .08)); } }}>
            <div className="mockup-canvas__surface"><div className="mockup-frame"><div className="mockup-frame__label"><strong>{activeScreen.name}</strong><span>{activeNode.stateId} · {activeViewportPreset.name}</span></div><PreviewErrorBoundary><ScreenPreview studio={studio} screen={activeScreen} stateId={activeNode.stateId} viewport={mockupViewport} theme={theme} zoom={mockupZoom / 100} fixture={activeFixture?.state} onAction={performAction} /></PreviewErrorBoundary></div></div>
          </div>
          <footer className="mockup-editor__zoom"><button type="button" onClick={() => setMockupZoom((current) => normalizeMockupZoom(current - 10))}>−</button><button type="button" className="mockup-editor__zoom-value" onClick={() => setMockupZoom(100)}>{Math.round(mockupZoom)}%</button><button type="button" onClick={() => setMockupZoom((current) => normalizeMockupZoom(current + 10))}>+</button><button type="button" onClick={fitMockup}>Fit</button></footer>
        </section>}
        {mode === 'settings' && <section className="panel-stack settings-workspace">
          <div className="section-heading"><div><span>STUDIO / SETTINGS</span><h2>Разрешения экранов</h2></div><p>Project-owned presets используются в previews, flow-картах и mockup-сценариях.</p></div>
          <article className="definition-card settings-card"><header><div><span>DEFAULT VIEWPORT</span><h3>Разрешение по умолчанию</h3><p>Применяется, когда экран или сценарий не задаёт другое разрешение. По умолчанию выбран базовый iPhone.</p></div><label>По умолчанию<select value={studioSettings.defaultViewportId} onChange={(event) => updateDefaultViewport(event.target.value)}><ViewportOptions presets={studioSettings.viewportPresets} /></select></label></header>
            {(['mobile', 'desktop'] as const).map((group) => { const presets = studioSettings.viewportPresets.filter((preset) => preset.group === group); return <section className="viewport-settings-section" key={group}><header><div><span>{group === 'mobile' ? 'MOBILE' : 'DESKTOP'}</span><h3>{group === 'mobile' ? 'Мобильные устройства' : 'Ноутбуки и мониторы'}</h3></div><strong>{presets.length} пресетов</strong></header><div className="viewport-settings-grid">{presets.map((preset) => <article className="viewport-setting" key={preset.id}><div className="viewport-setting__preview" style={{ aspectRatio: `${preset.width} / ${preset.height}` }}><span>{preset.width}×{preset.height}</span></div><div><code>{preset.id}</code><label>Название<input key={`${preset.id}:name:${preset.name}`} defaultValue={preset.name} onBlur={(event) => event.target.value.trim() && event.target.value.trim() !== preset.name && updateViewportPreset(preset.id, { name: event.target.value.trim() })} /></label><div className="viewport-setting__dimensions"><label>Ширина<input type="number" min="1" key={`${preset.id}:width:${preset.width}`} defaultValue={preset.width} onBlur={(event) => { const value = Number(event.target.value); if (value > 0 && value !== preset.width) updateViewportPreset(preset.id, { width: value }); }} /></label><label>Высота<input type="number" min="1" key={`${preset.id}:height:${preset.height}`} defaultValue={preset.height} onBlur={(event) => { const value = Number(event.target.value); if (value > 0 && value !== preset.height) updateViewportPreset(preset.id, { height: value }); }} /></label></div><label>Для чего проверяем<input key={`${preset.id}:purpose:${preset.purpose}`} defaultValue={preset.purpose || ''} onBlur={(event) => event.target.value.trim() && event.target.value.trim() !== preset.purpose && updateViewportPreset(preset.id, { purpose: event.target.value.trim() })} /></label></div></article>)}</div></section>; })}
          </article>
        </section>}
        {zoomMode && <div className="workspace-zoom"><ZoomControl value={zoomLevels[zoomMode]} onChange={updateZoom} /></div>}
      </div>
    </section>
    <aside className="studio-inspector" id="studio-tools-panel" aria-hidden={inspectorCollapsed} inert={inspectorCollapsed}>
      <header><span>TOOLS</span><h2>{mode === 'mockup' ? 'Инструменты проверки' : 'Инструменты'}</h2></header>
      <div className="studio-inspector__body">
        <section className="implementation-prompt">
          <div><span>AI PROMPT</span><strong>Реализовать компонент</strong></div>
          <label>Компонент<select value={promptComponent?.id || ''} onChange={(event) => setPromptComponentId(event.target.value)}>{studio.components.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.classification}</option>)}</select></label>
          <textarea value={implementationPrompt} readOnly rows={5} aria-label="Готовый промт для реализации компонента" />
          <button className="primary-button" type="button" disabled={!implementationPrompt} onClick={async () => { try { await navigator.clipboard.writeText(implementationPrompt); setMessage(`Промт для ${promptComponent?.name} скопирован`); } catch { setMessage('Не удалось скопировать промт'); } }}>Скопировать промт</button>
          <small>{promptComponentPath || 'Определяю локальный путь…'}</small>
        </section>
        <label>Тема<select value={theme.id} onChange={(event) => setThemeId(event.target.value)}>{studio.tokens.themes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {mode === 'components' && activeComponent && <><List title="Назначение" items={[activeComponent.description || activeComponent.usage]} /><List title="Зависимости" items={activeComponent.dependencies} /><List title="Свойства" items={activeComponent.properties} /><List title="Размеры" items={activeComponent.sizes} /><List title="События" items={activeComponent.actions} /><List title="Токены" items={activeComponent.tokenRefs} /><List title="Ограничения" items={activeComponent.restrictions} /><List title="Доступность" items={[`ARIA: ${activeComponent.accessibility?.role || 'не задано'}`, activeComponent.responsiveBehavior]} /></>}
        {mode === 'screens' && screen && <>
          <label>Состояние<select value={stateId} onChange={(event) => setStateId(event.target.value)}>{screen.states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Разрешение<select value={viewport} onChange={(event) => setViewport(event.target.value)}><ViewportOptions presets={studioSettings.viewportPresets} /></select></label>
          <List title="Задача" items={[screen.userTask]} /><List title="Лейаут" items={[screen.layoutId]} /><List title="Точки входа" items={screen.entryPoints} /><List title="Действия" items={screen.actions} /><Questions items={screen.openQuestions} /><code>#/screens/{screen.id}/{stateId}/{viewport}</code>
        </>}
        {mode === 'flows' && flow && <><List title="Цель" items={[flow.goal]} /><List title="Узлы" items={[`${flow.nodes.length} экранов`]} /><List title="Переходы" items={[`${flow.transitions.length} связей`]} /><p>Перетаскивайте экраны на карте — новые координаты сохраняются автоматически.</p></>}
        {mode === 'mockup' && mockup && <>
          <label>Тестовые данные<select value={fixtureId} onChange={(event) => setFixtureId(event.target.value)}>{mockup.fixtures.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Viewport<select value={mockupViewport} onChange={(event) => setMockupViewport(event.target.value)}><ViewportOptions presets={studioSettings.viewportPresets} /></select></label>
          <button className="secondary-button" onClick={resetMockup}>Перезапустить и сбросить</button><button className="ghost-button" disabled={!history.length} onClick={() => { const previous = history.at(-1); if (previous) { setMockupNodeId(previous); setHistory((items) => items.slice(0, -1)); } }}>← Назад</button><List title="Реализовано" items={mockup.implementedInteractions} /><List title="Имитируется" items={mockup.simulatedInteractions} /><Questions items={mockup.openQuestions} />
        </>}
      </div>
      <footer><button className="secondary-button" onClick={() => setEditorOpen(true)}>Редактировать JSON</button><button className="ghost-button" onClick={() => setExportOpen(true)}>Экспорт адаптеров</button><button className="ghost-button" onClick={() => loadStudio(true)}>Перечитать данные</button></footer>
    </aside>
    {editorOpen && <div className="editor-modal" role="dialog" aria-modal="true"><div className="editor-modal__card"><header><div><span>REPO-LOCAL SOURCES</span><h2>Сводное представление · schema v1</h2></div><button onClick={() => setEditorOpen(false)}>×</button></header><p>Редактор временно объединяет проектные файлы. При сохранении каждая сущность записывается обратно в свой JSON-файл.</p><textarea value={editorValue} onChange={(event) => setEditorValue(event.target.value)} spellCheck="false" /><footer><button className="secondary-button" onClick={() => setEditorValue(JSON.stringify(studio, null, 2))}>Сбросить</button><button className="primary-button" onClick={saveJson}>Сохранить по файлам</button></footer></div></div>}
    {exportOpen && <div className="editor-modal" role="dialog" aria-modal="true"><div className="editor-modal__card export-modal"><header><div><span>PLATFORM ADAPTERS</span><h2>Экспорт токенов</h2></div><button onClick={() => setExportOpen(false)}>×</button></header><div className="capability-table"><div className="capability-row is-header"><span>Платформа</span><span>Tokens</span><span>Components</span><span>Screens</span></div>{CAPABILITIES.map((row) => <div className="capability-row" key={row.platform}><strong>{row.platform}</strong><span>{row.tokens}</span><span>{row.components}</span><span>{row.screens}</span></div>)}</div><div className="export-grid">{(['web', 'flutter', 'compose', 'swiftui'] as Platform[]).map((platform) => { const result = exportStudio(studio, platform); return <article key={platform}><span>{result.language}</span><h3>{result.filename}</h3><pre>{result.content.slice(0, 420)}</pre><button className="primary-button" onClick={() => download(result.filename, result.content)}>Скачать</button></article>; })}</div></div></div>}
  </main>;
}
