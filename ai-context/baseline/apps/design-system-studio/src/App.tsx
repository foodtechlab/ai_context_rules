import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';

import { CAPABILITIES, exportStudio, type Platform } from './adapters';
import PreviewErrorBoundary from './PreviewErrorBoundary';
import { ComponentPreview, ScreenMapNodeView, ScreenPreview } from './renderers';
import type { ScreenMapDefinition, StudioData, Theme } from './types';
import { VIEWPORTS } from './types';

type Mode = 'foundations' | 'components' | 'screens' | 'maps' | 'prototype' | 'export';
type MapFlowNode = Node<{ node: ScreenMapDefinition['nodes'][number]; studio: StudioData; theme: Theme }, 'screen'>;

const NODE_TYPES = { screen: ScreenMapNodeView };
const NAVIGATION: Array<[Mode, string, string]> = [
  ['foundations', 'Foundations', '◫'],
  ['components', 'Компоненты', '◇'],
  ['screens', 'Экраны', '▣'],
  ['maps', 'Карты экранов', '⌘'],
  ['prototype', 'Mockup', '▶'],
  ['export', 'Экспорт', '⇱'],
];
const INITIAL_ROUTE = window.location.hash.replace(/^#\/?/, '').split('/');

function initialMode(): Mode {
  const candidate = INITIAL_ROUTE[0] as Mode;
  return NAVIGATION.some(([mode]) => mode === candidate) ? candidate : 'foundations';
}

function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [themeId, setThemeId] = useState('');
  const [screenId, setScreenId] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[1] || '' : '');
  const [stateId, setStateId] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[2] || '' : '');
  const [viewport, setViewport] = useState(INITIAL_ROUTE[0] === 'screens' ? INITIAL_ROUTE[3] || 'desktop' : 'desktop');
  const [mapId, setMapId] = useState(INITIAL_ROUTE[0] === 'maps' ? INITIAL_ROUTE[1] || '' : '');
  const [prototypeId, setPrototypeId] = useState(INITIAL_ROUTE[0] === 'prototype' ? INITIAL_ROUTE[1] || '' : '');
  const [fixtureId, setFixtureId] = useState(INITIAL_ROUTE[0] === 'prototype' ? INITIAL_ROUTE[3] || '' : '');
  const [prototypeNodeId, setPrototypeNodeId] = useState(INITIAL_ROUTE[0] === 'prototype' ? INITIAL_ROUTE[2] || '' : '');
  const [prototypeHistory, setPrototypeHistory] = useState<string[]>([]);
  const [message, setMessage] = useState('Загрузка studio…');
  const [isSaving, setIsSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<MapFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const loadStudio = useCallback(async (notify = false) => {
    setMessage(notify ? 'Перечитываю данные…' : 'Загрузка studio…');
    try {
      const response = await fetch('/api/studio');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Не удалось загрузить studio');
      setStudio(payload);
      setEditorValue(JSON.stringify(payload, null, 2));
      setThemeId((current) => current || payload.themes[0]?.id || '');
      setScreenId((current) => current || payload.screens[0]?.id || '');
      setMapId((current) => current || payload.screenMaps[0]?.id || '');
      setPrototypeId((current) => current || payload.prototypes[0]?.id || '');
      setMessage(notify ? 'Данные перечитаны' : '');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => { loadStudio(); }, [loadStudio]);
  useEffect(() => {
    if (!studio) return;
    let route = `#/${mode}`;
    if (mode === 'screens' && screenId && stateId) route += `/${screenId}/${stateId}/${viewport}`;
    if (mode === 'maps' && mapId) route += `/${mapId}`;
    if (mode === 'prototype' && prototypeId && prototypeNodeId) route += `/${prototypeId}/${prototypeNodeId}/${fixtureId}`;
    window.history.replaceState(null, '', route);
  }, [studio, mode, screenId, stateId, viewport, mapId, prototypeId, prototypeNodeId, fixtureId]);

  const saveStudio = useCallback(async (nextStudio: StudioData, successMessage = 'Изменения сохранены локально') => {
    setIsSaving(true);
    setMessage('Сохраняю…');
    try {
      const response = await fetch('/api/studio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextStudio),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Не удалось сохранить studio');
      setStudio(payload.studio);
      setEditorValue(JSON.stringify(payload.studio, null, 2));
      setMessage(successMessage);
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const theme = useMemo(() => studio?.themes.find((item) => item.id === themeId) || studio?.themes[0], [studio, themeId]);
  const screen = useMemo(() => studio?.screens.find((item) => item.id === screenId) || studio?.screens[0], [studio, screenId]);
  const screenMap = useMemo(() => studio?.screenMaps.find((item) => item.id === mapId) || studio?.screenMaps[0], [studio, mapId]);
  const prototype = useMemo(() => studio?.prototypes.find((item) => item.id === prototypeId) || studio?.prototypes[0], [studio, prototypeId]);

  useEffect(() => {
    if (!screen) return;
    if (!screen.states.some((item) => item.id === stateId)) setStateId(screen.states[0]?.id || '');
    if (!screen.viewports.includes(viewport)) setViewport(screen.viewports[0] || 'desktop');
  }, [screen, stateId, viewport]);

  useEffect(() => {
    if (!studio || !screenMap || !theme) {
      setNodes([]);
      setEdges([]);
      return;
    }
    setNodes(screenMap.nodes.map((node) => ({ id: node.id, type: 'screen', position: node.position, data: { node, studio, theme } })));
    setEdges(screenMap.edges.map((edge) => ({ ...edge, label: edge.label || edge.actionId, type: 'smoothstep', animated: true })));
  }, [studio, screenMap, theme, setNodes, setEdges]);

  useEffect(() => {
    if (!prototype || !studio) return;
    const selectedFixture = prototype.fixtures.find((item) => item.id === fixtureId) || prototype.fixtures[0];
    if (selectedFixture && selectedFixture.id !== fixtureId) setFixtureId(selectedFixture.id);
    if (!prototypeNodeId || !studio.screenMaps.find((item) => item.id === prototype.mapId)?.nodes.some((item) => item.id === prototypeNodeId)) {
      setPrototypeNodeId(prototype.startNodeId);
      setPrototypeHistory([]);
    }
  }, [prototype, studio, fixtureId, prototypeNodeId]);

  if (!studio || !theme) {
    return <main className="loading-screen"><span className="spinner" />{message}</main>;
  }

  const saveJson = async () => {
    try {
      const parsed = JSON.parse(editorValue) as StudioData;
      if (await saveStudio(parsed, 'JSON сохранён локально')) setEditorOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const updateToken = async (group: string, name: string, value: string) => {
    const next = {
      ...studio,
      themes: studio.themes.map((item) => item.id === theme.id ? {
        ...item,
        tokens: { ...item.tokens, [group]: { ...item.tokens[group], [name]: value } },
      } : item),
    };
    await saveStudio(next, `Токен ${group}.${name} сохранён`);
  };

  const saveMapPosition = async (draggedNode: MapFlowNode) => {
    if (!screenMap) return;
    const next = {
      ...studio,
      screenMaps: studio.screenMaps.map((item) => item.id === screenMap.id ? {
        ...item,
        nodes: item.nodes.map((node) => node.id === draggedNode.id ? { ...node, position: draggedNode.position } : node),
      } : item),
    };
    await saveStudio(next, 'Положение экрана сохранено');
  };

  const currentPrototypeMap = studio.screenMaps.find((item) => item.id === prototype?.mapId);
  const currentPrototypeNode = currentPrototypeMap?.nodes.find((item) => item.id === prototypeNodeId);
  const currentPrototypeScreen = studio.screens.find((item) => item.id === currentPrototypeNode?.screenId);
  const currentFixture = prototype?.fixtures.find((item) => item.id === fixtureId) || prototype?.fixtures[0];
  const performAction = (actionId: string) => {
    const transition = currentPrototypeMap?.edges.find((edge) => edge.source === prototypeNodeId && edge.actionId === actionId);
    if (!transition) {
      setMessage(`Для действия «${actionId}» переход не задан`);
      return;
    }
    setPrototypeHistory((history) => [...history, prototypeNodeId]);
    setPrototypeNodeId(transition.target);
    setMessage(`Переход: ${transition.label || transition.actionId}`);
  };

  return (
    <main className="studio-shell">
      <aside className="studio-sidebar">
        <div className="studio-brand">
          <span>AIC / CODE-FIRST</span>
          <h1>Design System<br />Studio</h1>
          <p>{studio.meta.name}</p>
        </div>
        <nav>
          {NAVIGATION.map(([value, label, icon]) => (
            <button key={value} className={mode === value ? 'is-active' : ''} onClick={() => setMode(value)}>
              <i>{icon}</i><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="studio-sidebar__footer">
          <label>Тема<select value={theme.id} onChange={(event) => setThemeId(event.target.value)}>{studio.themes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <button className="secondary-button" onClick={() => setEditorOpen(true)}>Редактировать JSON</button>
          <button className="ghost-button" onClick={() => loadStudio(true)}>Перечитать данные</button>
        </div>
      </aside>

      <section className="studio-main">
        <header className="topbar">
          <div><span>DESIGN SYSTEM</span><strong>{NAVIGATION.find(([value]) => value === mode)?.[1]}</strong></div>
          <div className="save-state"><i className={isSaving ? 'is-saving' : ''} />{message || 'Все изменения сохранены локально'}</div>
        </header>

        <div className="workspace">
          {mode === 'foundations' && (
            <section className="panel-stack">
              <div className="section-heading"><div><span>FOUNDATIONS</span><h2>Токены как контракт</h2></div><p>Изменения пишутся в repo-local studio.json и используются всеми preview и adapters.</p></div>
              {Object.entries(theme.tokens).map(([group, tokens]) => (
                <article className="token-group" key={group}>
                  <header><h3>{group}</h3><span>{Object.keys(tokens).length} tokens</span></header>
                  <div className="token-grid">
                    {Object.entries(tokens).map(([name, value]) => (
                      <label className="token-card" key={name}>
                        {group === 'color' && <i style={{ background: value }} />}
                        <span>{name}</span>
                        <input defaultValue={value} onBlur={(event) => event.target.value !== value && updateToken(group, name, event.target.value)} />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          )}

          {mode === 'components' && (
            <section className="panel-stack">
              <div className="section-heading"><div><span>COMPONENT WORKBENCH</span><h2>Variants × states</h2></div><p>Reference Web renderer показывает все заявленные комбинации компонента.</p></div>
              {studio.components.map((component) => (
                <article className="component-spec" key={component.id}>
                  <header><div><h3>{component.name}</h3><p>{component.description}</p></div><code>{component.kind}</code></header>
                  <div className="state-matrix">
                    {component.variants.flatMap((variant) => component.states.map((state) => (
                      <div className="state-cell" key={`${variant}:${state}`}><span>{variant} / {state}</span><ComponentPreview definition={component} variant={variant} state={state} /></div>
                    )))}
                  </div>
                  <footer><span>ARIA: {component.accessibility?.role || '—'}</span><span>{component.platforms?.join(' · ')}</span></footer>
                </article>
              ))}
            </section>
          )}

          {mode === 'screens' && screen && (
            <section className="screen-workspace">
              <aside className="controls-panel">
                <label>Экран<select value={screen.id} onChange={(event) => setScreenId(event.target.value)}>{studio.screens.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label>Состояние<select value={stateId} onChange={(event) => setStateId(event.target.value)}>{screen.states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <div><span>Разрешение</span><div className="segmented">{screen.viewports.map((item) => <button key={item} className={viewport === item ? 'is-active' : ''} onClick={() => setViewport(item)}>{VIEWPORTS[item]?.name || item}</button>)}</div></div>
                <p>{screen.description}</p>
                <code>#/screens/{screen.id}/{stateId}/{viewport}</code>
              </aside>
              <div className="preview-stage"><PreviewErrorBoundary><ScreenPreview studio={studio} screen={screen} stateId={stateId} viewport={viewport} theme={theme} fixture={{ userName: 'Алекс' }} /></PreviewErrorBoundary></div>
            </section>
          )}

          {mode === 'maps' && screenMap && (
            <section className="map-workspace">
              <div className="map-toolbar"><label>Карта<select value={screenMap.id} onChange={(event) => setMapId(event.target.value)}>{studio.screenMaps.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span>{screenMap.nodes.length} экранов · {screenMap.edges.length} переходов</span></div>
              <ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeDragStop={(_event, node) => saveMapPosition(node)} fitView minZoom={0.15} maxZoom={1.4} nodesConnectable={false}>
                <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#313744" /><Controls position="bottom-right" /><MiniMap position="bottom-left" nodeColor="#a18cff" maskColor="rgba(10,12,18,.78)" />
              </ReactFlow>
            </section>
          )}

          {mode === 'prototype' && prototype && currentPrototypeNode && currentPrototypeScreen && (
            <section className="prototype-workspace">
              <aside className="controls-panel">
                <label>Сценарий<select value={prototype.id} onChange={(event) => { setPrototypeId(event.target.value); setPrototypeNodeId(''); }}>{studio.prototypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label>Fixture<select value={fixtureId} onChange={(event) => setFixtureId(event.target.value)}>{prototype.fixtures.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <button className="secondary-button" onClick={() => { setPrototypeNodeId(prototype.startNodeId); setPrototypeHistory([]); }}>Начать заново</button>
                <button className="ghost-button" disabled={!prototypeHistory.length} onClick={() => { const previous = prototypeHistory.at(-1); if (previous) { setPrototypeNodeId(previous); setPrototypeHistory((history) => history.slice(0, -1)); } }}>← Назад</button>
                <p>Текущий узел: <code>{prototypeNodeId}</code></p>
              </aside>
              <div className="preview-stage is-prototype"><PreviewErrorBoundary><ScreenPreview studio={studio} screen={currentPrototypeScreen} stateId={currentPrototypeNode.stateId} viewport={currentPrototypeNode.viewport} theme={theme} fixture={currentFixture?.state} onAction={performAction} /></PreviewErrorBoundary></div>
            </section>
          )}

          {mode === 'export' && (
            <section className="panel-stack">
              <div className="section-heading"><div><span>PLATFORM ADAPTERS</span><h2>Один контракт — разные платформы</h2></div><p>Adapters генерируют отдельные файлы и не изменяют handwritten code.</p></div>
              <div className="capability-table"><div className="capability-row is-header"><span>Платформа</span><span>Tokens</span><span>Components</span><span>Screens</span></div>{CAPABILITIES.map((row) => <div className="capability-row" key={row.platform}><strong>{row.platform}</strong><span>{row.tokens}</span><span>{row.components}</span><span>{row.screens}</span></div>)}</div>
              <div className="export-grid">{(['web', 'flutter', 'compose', 'swiftui'] as Platform[]).map((platform) => { const result = exportStudio(studio, platform); return <article key={platform}><span>{result.language}</span><h3>{result.filename}</h3><pre>{result.content.slice(0, 420)}</pre><button className="primary-button" onClick={() => download(result.filename, result.content)}>Скачать</button></article>; })}</div>
            </section>
          )}
        </div>
      </section>

      {editorOpen && (
        <div className="editor-modal" role="dialog" aria-modal="true" aria-label="Редактор studio.json">
          <div className="editor-modal__card"><header><div><span>REPO-LOCAL SOURCE</span><h2>studio.json</h2></div><button onClick={() => setEditorOpen(false)}>×</button></header><p>JSON проходит schema и reference validation перед атомарной записью.</p><textarea value={editorValue} onChange={(event) => setEditorValue(event.target.value)} spellCheck="false" /><footer><button className="secondary-button" onClick={() => setEditorValue(JSON.stringify(studio, null, 2))}>Сбросить</button><button className="primary-button" onClick={saveJson}>Сохранить</button></footer></div>
        </div>
      )}
    </main>
  );
}
