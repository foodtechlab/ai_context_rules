import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import EntityNode from './EntityNode.jsx';
import EntityDesignerModal from './EntityDesignerModal.jsx';
import {
  createFlowModel,
  emptyGeneratedData,
  emptyUserData,
  validateCombinedDatasets,
} from './data-model.js';

const nodeTypes = {
  entity: EntityNode,
  enum: EntityNode,
  'inner-class': EntityNode,
};

const KIND_LABELS = {
  all: 'Все элементы',
  entity: 'Сущности',
  enum: 'Перечисления',
  'inner-class': 'Внутренние классы',
};

export default function App() {
  const [generated, setGenerated] = useState(emptyGeneratedData);
  const [userData, setUserData] = useState(emptyUserData);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [selected, setSelected] = useState(null);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [message, setMessage] = useState('Загрузка данных…');
  const [isLoading, setIsLoading] = useState(true);
  const [flow, setFlow] = useState(null);

  const loadData = useCallback(async (showSuccess = false) => {
    setIsLoading(true);
    setMessage(showSuccess ? 'Перечитываю данные…' : 'Загрузка данных…');
    try {
      const response = await fetch('/api/dataset');
      if (!response.ok) throw new Error((await response.json()).error || 'Не удалось загрузить данные');
      const payload = await response.json();
      setGenerated(payload.generated);
      setUserData(payload.user);
      setEditorValue(JSON.stringify(payload.user, null, 2));
      setMessage(showSuccess ? 'Данные перечитаны' : '');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const model = createFlowModel(generated, userData);
    setNodes(model.nodes);
    setEdges(model.edges);
  }, [generated, userData, setNodes, setEdges]);

  const visibleNodeIds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru');
    return new Set(
      nodes
        .filter(({ data }) => {
          const element = data.element;
          const matchesKind = kind === 'all' || element.kind === kind;
          const haystack = `${element.name} ${element.qualifiedName || ''} ${element.description || ''} ${element.module || ''}`
            .toLocaleLowerCase('ru');
          return matchesKind && (!normalizedQuery || haystack.includes(normalizedQuery));
        })
        .map((node) => node.id),
    );
  }, [kind, nodes, query]);

  const displayedNodes = useMemo(
    () => nodes.map((node) => ({ ...node, hidden: !visibleNodeIds.has(node.id) })),
    [nodes, visibleNodeIds],
  );
  const displayedEdges = useMemo(
    () => edges.map((edge) => ({ ...edge, hidden: !visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target) })),
    [edges, visibleNodeIds],
  );

  const counts = useMemo(() => {
    const result = { entity: 0, enum: 0, 'inner-class': 0 };
    nodes.forEach(({ data }) => {
      result[data.element.kind] += 1;
    });
    return result;
  }, [nodes]);

  const saveUserData = useCallback(async (nextUserData) => {
    const response = await fetch('/api/user-data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextUserData),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Не удалось сохранить user.json');
    setUserData(payload.user);
    setEditorValue(JSON.stringify(payload.user, null, 2));
  }, []);

  const saveEditor = async () => {
    try {
      const parsed = JSON.parse(editorValue);
      const errors = validateCombinedDatasets(generated, parsed);
      if (errors.length) throw new Error(errors.join('; '));
      await saveUserData(parsed);
      setMessage('Пользовательские данные сохранены');
      setEditorOpen(false);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveLayout = async (draggedNode = null) => {
    try {
      const layout = Object.fromEntries(nodes.map((node) => [
        node.id,
        node.id === draggedNode?.id ? draggedNode.position : node.position,
      ]));
      await saveUserData({ ...userData, layout });
      setMessage('Расположение элементов сохранено в user.json');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const createDraftElement = async (element) => {
    const identity = (element.qualifiedName || element.name).replace(/\s+/g, '-');
    const existingIds = new Set([
      ...generated.elements.map((item) => item.id),
      ...userData.elements.map((item) => item.id),
    ]);
    const baseId = `${element.kind}:draft:${identity}`;
    let id = baseId;
    let suffix = 2;
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const position = flow?.screenToFlowPosition({
      x: window.innerWidth * 0.62,
      y: window.innerHeight * 0.45,
    }) || { x: 120, y: 120 };
    const nextUserData = {
      ...userData,
      elements: [...userData.elements, { id, ...element }],
      layout: { ...userData.layout, [id]: position },
    };

    await saveUserData(nextUserData);
    setDesignerOpen(false);
    setSelected(id);
    setMessage(`Сущность «${element.name}» добавлена в user.json`);
  };

  const selectedElement = nodes.find((node) => node.id === selected)?.data.element;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__eyebrow">AI CONTEXT / BACKEND</span>
          <h1>Entity Map</h1>
          <p>Живая схема доменных типов репозитория</p>
        </div>

        <label className="search">
          <span>Поиск</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, модуль, описание…" />
        </label>

        <nav className="filters" aria-label="Фильтр элементов">
          {Object.entries(KIND_LABELS).map(([value, label]) => (
            <button key={value} className={kind === value ? 'is-active' : ''} onClick={() => setKind(value)}>
              <span>{label}</span>
              <strong>{value === 'all' ? nodes.length : counts[value]}</strong>
            </button>
          ))}
        </nav>

        <div className="legend">
          <span><i className="legend__dot legend__dot--entity" />Сущность</span>
          <span><i className="legend__dot legend__dot--enum" />Перечисление</span>
          <span><i className="legend__dot legend__dot--inner" />Внутренний класс</span>
          <span><i className="legend__project" />Проектируемое вручную</span>
        </div>

        <div className="sidebar__actions">
          <button className="button button--design" onClick={() => setDesignerOpen(true)}>+ Добавить сущность</button>
          <button className="button" onClick={() => setEditorOpen(true)}>Редактировать user.json</button>
          <button className="button" onClick={() => saveLayout()}>Сохранить расположение</button>
          <button
            className={`button button--ghost${isLoading ? ' button--loading' : ''}`}
            onClick={() => loadData(true)}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading && <span className="button__spinner" aria-hidden="true" />}
            {isLoading ? 'Перечитываю…' : 'Перечитать данные'}
          </button>
        </div>

        <div className="source-meta">
          <span>Источник AI</span>
          <strong>{generated.source?.repository || 'не определён'}</strong>
          <small>{generated.generatedAt ? `Обновлено ${new Date(generated.generatedAt).toLocaleString('ru')}` : 'Данные ещё не собраны'}</small>
        </div>
      </aside>

      <section className="canvas">
        <div className="canvas__toolbar">
          <div><strong>{visibleNodeIds.size}</strong> из {nodes.length} элементов</div>
          <div className="toolbar__actions">
            <button onClick={() => flow?.fitView({ padding: 0.18, duration: 350 })}>Показать всё</button>
          </div>
        </div>
        <ReactFlow
          nodes={displayedNodes}
          edges={displayedEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_event, node) => setSelected(node.id)}
          onNodeDragStop={(_event, node) => saveLayout(node)}
          onPaneClick={() => setSelected(null)}
          onInit={setFlow}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          nodesConnectable={false}
          proOptions={{ hideAttribution: false }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.3} color="#303845" />
          <Controls position="bottom-right" />
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor={(node) => node.data.element.origin === 'user'
              ? '#ff8f70'
              : ({ entity: '#58b9f4', enum: '#f4bd66', 'inner-class': '#a98cff' })[node.type]}
            maskColor="rgba(12, 15, 20, 0.72)"
          />
        </ReactFlow>
        {message && <div className="toast">{message}</div>}
      </section>

      {selectedElement && (
        <aside className="inspector">
          <button className="inspector__close" onClick={() => setSelected(null)} aria-label="Закрыть">×</button>
          <span className="inspector__kind">{KIND_LABELS[selectedElement.kind]}</span>
          <h2>{selectedElement.name}</h2>
          <code className="inspector__qualified">{selectedElement.qualifiedName}</code>
          <p>{selectedElement.description || 'Описание пока не добавлено.'}</p>
          {selectedElement.note && <div className="inspector__note">{selectedElement.note}</div>}
          <dl>
            {selectedElement.sourcePath && (
              <>
              <dt>Файл</dt><dd>{selectedElement.sourcePath}{selectedElement.line ? `:${selectedElement.line}` : ''}</dd>
              </>
            )}
            <dt>Модуль</dt><dd>{selectedElement.module || '—'}</dd>
            <dt>Источник</dt><dd>{selectedElement.origin === 'user' ? 'Ручной проект' : 'AI'}</dd>
          </dl>
        </aside>
      )}

      {designerOpen && (
        <EntityDesignerModal onClose={() => setDesignerOpen(false)} onCreate={createDraftElement} />
      )}

      {editorOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Редактор пользовательских данных">
          <div className="modal__card">
            <header>
              <div><span>REPOSITORY DATA</span><h2>user.json</h2></div>
              <button onClick={() => setEditorOpen(false)} aria-label="Закрыть">×</button>
            </header>
            <p>Добавляйте элементы, связи, аннотации и layout. AI-generated данные останутся неизменными.</p>
            <textarea value={editorValue} onChange={(event) => setEditorValue(event.target.value)} spellCheck="false" />
            <footer>
              <button className="button" onClick={() => setEditorValue(JSON.stringify(userData, null, 2))}>Сбросить</button>
              <button className="button button--primary" onClick={saveEditor}>Сохранить JSON</button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
