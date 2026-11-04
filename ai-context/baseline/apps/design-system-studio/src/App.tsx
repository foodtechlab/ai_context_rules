import { useCallback, useEffect, useMemo, useState } from 'react';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Edge, type Node } from '@xyflow/react';

import { CAPABILITIES, exportStudio, type Platform } from './adapters';
import PreviewErrorBoundary from './PreviewErrorBoundary';
import { ComponentPreview, ScreenMapNodeView, ScreenPreview } from './renderers';
import { resolveTheme, VIEWPORTS, type FlowDefinition, type StudioData, type Theme, type TokenCategory, type TokenTier } from './types';

type Mode = 'base' | 'tokens' | 'components' | 'layouts' | 'screens' | 'flows' | 'mockup';
type FlowNode = Node<{ node: FlowDefinition['nodes'][number]; studio: StudioData; theme: Theme }, 'screen'>;
const NODE_TYPES = { screen: ScreenMapNodeView };
const NAVIGATION: Array<[Mode, string, string]> = [
  ['base', 'Базовая система', '◉'], ['tokens', 'Токены', '◫'], ['components', 'Компоненты', '◇'],
  ['layouts', 'Лейауты', '▤'], ['screens', 'Экраны', '▣'], ['flows', 'Flow', '⌘'], ['mockup', 'Mockup', '▶'],
];
const TOKEN_GROUPS: Array<[TokenCategory, string]> = [['colors', 'Цвета'], ['typography', 'Типографика'], ['parameters', 'Остальные параметры']];
const TOKEN_TIERS: Array<[TokenTier, string]> = [['base', 'Базовые'], ['semantic', 'Семантические'], ['component', 'Компонентные']];
const INITIAL_ROUTE = window.location.hash.replace(/^#\/?/, '').split('/');

function initialMode(): Mode {
  const candidate = INITIAL_ROUTE[0] as Mode;
  return NAVIGATION.some(([mode]) => mode === candidate) ? candidate : 'base';
}
function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
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

export default function App() {
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [themeId, setThemeId] = useState('');
  const [screenId, setScreenId] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[1] || '' : '');
  const [stateId, setStateId] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[2] || '' : '');
  const [viewport, setViewport] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[3] || 'desktop' : 'desktop');
  const [flowId, setFlowId] = useState(INITIAL_ROUTE[0] === 'flows' ? INITIAL_ROUTE[1] || '' : '');
  const [mockupId, setMockupId] = useState(INITIAL_ROUTE[0] === 'mockup' ? INITIAL_ROUTE[1] || '' : '');
  const [fixtureId, setFixtureId] = useState(INITIAL_ROUTE[0] === 'mockup' ? INITIAL_ROUTE[3] || '' : '');
  const [mockupNodeId, setMockupNodeId] = useState(INITIAL_ROUTE[0] === 'mockup' ? INITIAL_ROUTE[2] || '' : '');
  const [mockupViewport, setMockupViewport] = useState('desktop');
  const [history, setHistory] = useState<string[]>([]);
  const [message, setMessage] = useState('Загрузка studio…');
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
  const [editorValue, setEditorValue] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const loadStudio = useCallback(async (notify = false) => {
    setMessage(notify ? 'Перечитываю данные…' : 'Загрузка studio…');
    try {
      const response = await fetch('/api/studio'); const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Не удалось загрузить studio');
      setStudio(payload); setEditorValue(JSON.stringify(payload, null, 2));
      setThemeId((current) => current || payload.tokens.themes[0]?.id || '');
      setScreenId((current) => current || payload.screens[0]?.id || '');
      setFlowId((current) => current || payload.flows[0]?.id || '');
      setMockupId((current) => current || payload.mockups[0]?.id || '');
      setMessage(notify ? 'Данные перечитаны' : '');
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
  }, []);
  useEffect(() => { loadStudio(); }, [loadStudio]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:navigation-collapsed', String(navigationCollapsed)); }, [navigationCollapsed]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:inspector-collapsed', String(inspectorCollapsed)); }, [inspectorCollapsed]);
  useEffect(() => { window.localStorage.setItem('aic:design-studio:expanded-tree', JSON.stringify([...expandedTreeIds])); }, [expandedTreeIds]);

  const saveStudio = useCallback(async (next: StudioData, success = 'Изменения сохранены локально') => {
    setIsSaving(true); setMessage('Сохраняю…');
    try {
      const response = await fetch('/api/studio', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Не удалось сохранить studio');
      setStudio(payload.studio); setEditorValue(JSON.stringify(payload.studio, null, 2)); setMessage(success); return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); return false; }
    finally { setIsSaving(false); }
  }, []);

  const theme = useMemo(() => studio ? resolveTheme(studio, themeId) : null, [studio, themeId]);
  const screen = useMemo(() => studio?.screens.find((item) => item.id === screenId) || studio?.screens[0], [studio, screenId]);
  const flow = useMemo(() => studio?.flows.find((item) => item.id === flowId) || studio?.flows[0], [studio, flowId]);
  const mockup = useMemo(() => studio?.mockups.find((item) => item.id === mockupId) || studio?.mockups[0], [studio, mockupId]);

  useEffect(() => {
    if (!studio) return;
    let route = `#/${mode}`;
    if (mode === 'screens' && screenId && stateId) route += `/${screenId}/${stateId}/${viewport}`;
    if (mode === 'flows' && flowId) route += `/${flowId}`;
    if (mode === 'mockup' && mockupId && mockupNodeId) route += `/${mockupId}/${mockupNodeId}/${fixtureId}`;
    window.history.replaceState(null, '', route);
  }, [studio, mode, screenId, stateId, viewport, flowId, mockupId, mockupNodeId, fixtureId]);
  useEffect(() => {
    if (!screen) return;
    if (!screen.states.some((item) => item.id === stateId)) setStateId(screen.states[0]?.id || '');
    if (!screen.viewports.includes(viewport)) setViewport(screen.viewports[0] || 'desktop');
  }, [screen, stateId, viewport]);
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
    if (!mockup.supportedViewports.includes(mockupViewport)) setMockupViewport(mockup.supportedViewports[0] || 'desktop');
    if (!mockupNodeId || !selectedFlow?.nodes.some((item) => item.id === mockupNodeId)) { setMockupNodeId(mockup.startNodeId); setHistory([]); }
  }, [mockup, studio, fixtureId, mockupNodeId, mockupViewport]);
  useEffect(() => {
    const activeItems = document.querySelectorAll<HTMLElement>('.project-tree button.is-active');
    activeItems.item(activeItems.length - 1)?.scrollIntoView({ block: 'nearest' });
  }, [mode, activeStructureId, screenId, flowId, mockupId]);

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
  const saveFlowPosition = async (draggedNode: FlowNode) => {
    if (!flow) return;
    const next = { ...studio, flows: studio.flows.map((item) => item.id === flow.id ? { ...item, nodes: item.nodes.map((node) => node.id === draggedNode.id ? { ...node, position: draggedNode.position } : node) } : item) };
    await saveStudio(next, 'Положение экрана во flow сохранено');
  };
  const activeFlow = studio.flows.find((item) => item.id === mockup?.flowId);
  const activeNode = activeFlow?.nodes.find((item) => item.id === mockupNodeId);
  const activeScreen = studio.screens.find((item) => item.id === activeNode?.screenId);
  const activeFixture = mockup?.fixtures.find((item) => item.id === fixtureId) || mockup?.fixtures[0];
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
  const projectTree: ProjectTreeNode = { id: 'project-root', label: 'design-system', tone: 'project', children: [
    { id: 'base', label: 'base-system', tone: 'base', active: mode === 'base', onSelect: () => openStructureItem('base') },
    { id: 'tokens', label: 'tokens', tone: 'tokens', count: TOKEN_GROUPS.reduce((total, [category]) => total + TOKEN_TIERS.reduce((subtotal, [tier]) => subtotal + studio.tokens[category][tier].length, 0), 0), active: mode === 'tokens' && !activeStructureId, onSelect: () => openStructureItem('tokens'), children: TOKEN_GROUPS.map(([category]) => ({ id: `tree-tokens-${category}`, label: category, tone: 'tokens', count: TOKEN_TIERS.reduce((total, [tier]) => total + studio.tokens[category][tier].length, 0), active: mode === 'tokens' && activeStructureId === `tokens-${category}`, onSelect: () => openStructureItem('tokens', `tokens-${category}`) })) },
    { id: 'components', label: 'components', tone: 'components', count: studio.components.length, active: mode === 'components' && !activeStructureId, onSelect: () => openStructureItem('components'), children: (['atom', 'molecule', 'organism'] as const).map((classification) => ({ id: `components-${classification}`, label: classification === 'atom' ? 'atoms' : classification === 'molecule' ? 'molecules' : 'organisms', tone: 'components', count: studio.components.filter((item) => item.classification === classification).length, active: mode === 'components' && activeStructureId === `components-${classification}`, onSelect: () => openStructureItem('components', `components-${classification}`), children: studio.components.filter((item) => item.classification === classification).map((component) => ({ id: `tree-component-${component.id}`, label: component.name, tone: 'component-file', active: mode === 'components' && activeStructureId === `component-${component.id}`, onSelect: () => openStructureItem('components', `component-${component.id}`) })) })) },
    { id: 'layouts', label: 'layouts', tone: 'layouts', count: studio.layouts.length, active: mode === 'layouts' && !activeStructureId, onSelect: () => openStructureItem('layouts'), children: studio.layouts.map((layout) => ({ id: `tree-layout-${layout.id}`, label: layout.name, tone: 'layout-file', active: mode === 'layouts' && activeStructureId === `layout-${layout.id}`, onSelect: () => openStructureItem('layouts', `layout-${layout.id}`) })) },
    { id: 'screens', label: 'screens', tone: 'screens', count: studio.screens.length, onSelect: () => setMode('screens'), children: studio.screens.map((item) => ({ id: `tree-screen-${item.id}`, label: item.name, tone: 'screen-file', count: item.states.length, active: mode === 'screens' && screen?.id === item.id, onSelect: () => { setMode('screens'); setScreenId(item.id); } })) },
    { id: 'flows', label: 'flows', tone: 'flows', count: studio.flows.length, onSelect: () => setMode('flows'), children: studio.flows.map((item) => ({ id: `tree-flow-${item.id}`, label: item.name, tone: 'flow-file', count: item.nodes.length, active: mode === 'flows' && flow?.id === item.id, onSelect: () => { setMode('flows'); setFlowId(item.id); } })) },
    { id: 'mockup', label: 'mockups', tone: 'mockups', count: studio.mockups.length, onSelect: () => setMode('mockup'), children: studio.mockups.map((item) => ({ id: `tree-mockup-${item.id}`, label: item.name, tone: 'mockup-file', count: item.fixtures.length, active: mode === 'mockup' && mockup?.id === item.id, onSelect: () => { setMode('mockup'); setMockupId(item.id); setMockupNodeId(''); } })) },
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
        {mode === 'tokens' && <section className="panel-stack">
          <div className="section-heading"><div><span>02 / TOKENS</span><h2>Базовые → семантические → компонентные</h2></div><p>Каждый токен имеет устойчивый id, назначение, ссылку или значение и overrides по темам.</p></div>
          {TOKEN_GROUPS.map(([category, categoryLabel]) => <article className="token-group" id={`tokens-${category}`} key={category}><header><h3>{categoryLabel}</h3><span>{TOKEN_TIERS.reduce((count, [tier]) => count + studio.tokens[category][tier].length, 0)} tokens</span></header>
            {TOKEN_TIERS.map(([tier, tierLabel]) => <div className="token-tier" key={tier}><div className="token-tier__title"><strong>{tierLabel}</strong><span>{studio.tokens[category][tier].length}</span></div><div className="token-grid">{studio.tokens[category][tier].map((token) => { const resolved = theme.tokens[token.id.split('.')[0]]?.[token.id.split('.').slice(1).join('.')] || token.value; return <label className="token-card" key={token.id}>{category === 'colors' && <i style={{ background: resolved }} />}<span>{token.id}</span><small>{token.purpose}</small><input key={`${token.id}:${theme.id}`} defaultValue={token.modes?.[theme.id] ?? token.value} onBlur={(event) => event.target.value !== (token.modes?.[theme.id] ?? token.value) && updateToken(category, tier, token.id, event.target.value)} /></label>; })}</div></div>)}
          </article>)}
        </section>}
        {mode === 'components' && <section className="panel-stack">
          <div className="section-heading"><div><span>03 / COMPONENTS</span><h2>Атомы, молекулы и организмы</h2></div><p>Одно основное определение компонента, варианты для изменений без смены назначения.</p></div>
          {(['atom', 'molecule', 'organism'] as const).map((classification) => <section className="classification-section" id={`components-${classification}`} key={classification}><h3>{classification === 'atom' ? 'Атомы' : classification === 'molecule' ? 'Молекулы' : 'Организмы'}</h3>{studio.components.filter((item) => item.classification === classification).map((component) => <article className="component-spec" id={`component-${component.id}`} key={component.id}><header><div><h3>{component.name}</h3><p>{component.description}</p></div><code>{component.id}</code></header><div className="state-matrix">{component.variants.flatMap((variant) => component.states.map((state) => <div className="state-cell" key={`${variant}:${state}`}><span>{variant} / {state}</span><ComponentPreview definition={component} variant={variant} state={state} /></div>))}</div><div className="definition-grid compact"><List title="Зависимости" items={component.dependencies} /><List title="Свойства" items={component.properties} /><List title="Размеры" items={component.sizes} /><List title="События" items={component.actions} /><List title="Токены" items={component.tokenRefs} /><List title="Ограничения" items={component.restrictions} /></div><footer><span>ARIA: {component.accessibility?.role || '—'}</span><span>{component.responsiveBehavior}</span></footer></article>)}</section>)}
        </section>}
        {mode === 'layouts' && <section className="panel-stack">
          <div className="section-heading"><div><span>04 / LAYOUTS</span><h2>Повторно используемые структуры</h2></div><p>Лейаут задаёт области, навигацию, сетку, прокрутку, safe areas и адаптацию.</p></div>
          {studio.layouts.map((layout) => <article className="definition-card" id={`layout-${layout.id}`} key={layout.id}><header><div><span>{layout.id}</span><h3>{layout.name}</h3><p>{layout.purpose}</p></div></header><div className="region-map">{layout.regions.map((region) => <div key={region.id} className={region.required ? 'is-required' : ''}><strong>{region.name}</strong><code>{region.id}</code><span>{region.required ? 'обязательный' : 'необязательный'}</span></div>)}</div><div className="definition-grid"><List title="Навигационные компоненты" items={layout.navigationComponentIds} /><List title="Токены" items={layout.tokenRefs} /><List title="Ширина и сетка" items={[layout.widthRules]} /><List title="Прокрутка" items={[layout.scrollRules]} /><List title="Safe area и клавиатура" items={[layout.safeAreaRules]} /><List title="Адаптация" items={[layout.responsiveBehavior]} /></div><Questions items={layout.openQuestions} /></article>)}
        </section>}
        {mode === 'screens' && screen && <section className="screen-workspace"><div className="preview-stage"><PreviewErrorBoundary><ScreenPreview studio={studio} screen={screen} stateId={stateId} viewport={viewport} theme={theme} fixture={{ userName: 'Алекс', adminName: 'Анна', organizationName: 'Northstar', createdUserName: 'Мария Орлова', selectedUserName: 'Анна Смирнова', selectedUserEmail: 'anna@northstar.dev' }} /></PreviewErrorBoundary></div></section>}
        {mode === 'flows' && flow && <section className="map-workspace"><div className="map-toolbar"><strong>{flow.name}</strong><span>{flow.nodes.length} экранов · {flow.transitions.length} переходов</span></div><ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeDragStop={(_event, node) => saveFlowPosition(node)} fitView minZoom={0.15} maxZoom={1.4} nodesConnectable={false}><Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#313744" /><Controls position="bottom-right" /><MiniMap position="bottom-left" nodeColor="#a18cff" maskColor="rgba(10,12,18,.78)" /></ReactFlow></section>}
        {mode === 'mockup' && mockup && activeNode && activeScreen && <section className="prototype-workspace"><div className="preview-stage is-prototype"><PreviewErrorBoundary><ScreenPreview studio={studio} screen={activeScreen} stateId={activeNode.stateId} viewport={mockupViewport} theme={theme} fixture={activeFixture?.state} onAction={performAction} /></PreviewErrorBoundary></div></section>}
      </div>
    </section>
    <aside className="studio-inspector" id="studio-tools-panel" aria-hidden={inspectorCollapsed} inert={inspectorCollapsed}>
      <header><span>TOOLS</span><h2>{mode === 'mockup' ? 'Инструменты проверки' : 'Инструменты'}</h2></header>
      <div className="studio-inspector__body">
        <label>Тема<select value={theme.id} onChange={(event) => setThemeId(event.target.value)}>{studio.tokens.themes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {mode === 'screens' && screen && <>
          <label>Состояние<select value={stateId} onChange={(event) => setStateId(event.target.value)}>{screen.states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <div><span>Разрешение</span><div className="segmented">{screen.viewports.map((item) => <button key={item} className={viewport === item ? 'is-active' : ''} onClick={() => setViewport(item)}>{VIEWPORTS[item]?.name || item}</button>)}</div></div>
          <List title="Задача" items={[screen.userTask]} /><List title="Лейаут" items={[screen.layoutId]} /><List title="Точки входа" items={screen.entryPoints} /><List title="Действия" items={screen.actions} /><Questions items={screen.openQuestions} /><code>#/screens/{screen.id}/{stateId}/{viewport}</code>
        </>}
        {mode === 'flows' && flow && <><List title="Цель" items={[flow.goal]} /><List title="Узлы" items={[`${flow.nodes.length} экранов`]} /><List title="Переходы" items={[`${flow.transitions.length} связей`]} /><p>Перетаскивайте экраны на карте — новые координаты сохраняются автоматически.</p></>}
        {mode === 'mockup' && mockup && <>
          <label>Тестовые данные<select value={fixtureId} onChange={(event) => setFixtureId(event.target.value)}>{mockup.fixtures.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Viewport<select value={mockupViewport} onChange={(event) => setMockupViewport(event.target.value)}>{mockup.supportedViewports.map((item) => <option key={item} value={item}>{VIEWPORTS[item]?.name || item}</option>)}</select></label>
          <button className="secondary-button" onClick={() => { setMockupNodeId(mockup.startNodeId); setHistory([]); }}>Перезапустить и сбросить</button><button className="ghost-button" disabled={!history.length} onClick={() => { const previous = history.at(-1); if (previous) { setMockupNodeId(previous); setHistory((items) => items.slice(0, -1)); } }}>← Назад</button><List title="Реализовано" items={mockup.implementedInteractions} /><List title="Имитируется" items={mockup.simulatedInteractions} /><Questions items={mockup.openQuestions} />
        </>}
      </div>
      <footer><button className="secondary-button" onClick={() => setEditorOpen(true)}>Редактировать JSON</button><button className="ghost-button" onClick={() => setExportOpen(true)}>Экспорт адаптеров</button><button className="ghost-button" onClick={() => loadStudio(true)}>Перечитать данные</button></footer>
    </aside>
    {editorOpen && <div className="editor-modal" role="dialog" aria-modal="true"><div className="editor-modal__card"><header><div><span>REPO-LOCAL SOURCE</span><h2>studio.json · schema v1</h2></div><button onClick={() => setEditorOpen(false)}>×</button></header><p>Семь разделов, связи и открытые вопросы валидируются перед атомарной записью.</p><textarea value={editorValue} onChange={(event) => setEditorValue(event.target.value)} spellCheck="false" /><footer><button className="secondary-button" onClick={() => setEditorValue(JSON.stringify(studio, null, 2))}>Сбросить</button><button className="primary-button" onClick={saveJson}>Сохранить</button></footer></div></div>}
    {exportOpen && <div className="editor-modal" role="dialog" aria-modal="true"><div className="editor-modal__card export-modal"><header><div><span>PLATFORM ADAPTERS</span><h2>Экспорт токенов</h2></div><button onClick={() => setExportOpen(false)}>×</button></header><div className="capability-table"><div className="capability-row is-header"><span>Платформа</span><span>Tokens</span><span>Components</span><span>Screens</span></div>{CAPABILITIES.map((row) => <div className="capability-row" key={row.platform}><strong>{row.platform}</strong><span>{row.tokens}</span><span>{row.components}</span><span>{row.screens}</span></div>)}</div><div className="export-grid">{(['web', 'flutter', 'compose', 'swiftui'] as Platform[]).map((platform) => { const result = exportStudio(studio, platform); return <article key={platform}><span>{result.language}</span><h3>{result.filename}</h3><pre>{result.content.slice(0, 420)}</pre><button className="primary-button" onClick={() => download(result.filename, result.content)}>Скачать</button></article>; })}</div></div></div>}
  </main>;
}
