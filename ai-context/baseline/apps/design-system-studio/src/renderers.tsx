import type { CSSProperties, ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';

import type { ComponentDefinition, LayoutDefinition, ScreenDefinition, ScreenMapNode, StudioData, Theme } from './types';
import { resolveViewport } from './types';
import PreviewErrorBoundary from './PreviewErrorBoundary';

function interpolate(value: unknown, fixture: Record<string, unknown>) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => String(fixture[key] ?? ''));
}

function themeStyle(theme: Theme) {
  const colors = theme.tokens.color || {};
  const typography = theme.tokens.typography || {};
  const radius = theme.tokens.radius || {};
  return {
    '--preview-background': colors.background,
    '--preview-surface': colors.surface,
    '--preview-text': colors.text,
    '--preview-primary': colors.primary,
    '--preview-border': colors.border,
    '--preview-font': typography.family,
    '--preview-body-size': typography.bodySize,
    '--preview-heading-size': typography.headingSize,
    '--preview-radius': radius.md,
  } as CSSProperties;
}

export function ComponentPreview({
  definition,
  variant = 'default',
  state = 'default',
  props = {},
  fixture = {},
  onAction,
}: {
  definition: ComponentDefinition;
  variant?: string;
  state?: string;
  props?: Record<string, unknown>;
  fixture?: Record<string, unknown>;
  onAction?: () => void;
}) {
  const merged = { ...definition.defaultProps, ...props };
  const label = String(interpolate(merged.label ?? definition.name, fixture));
  const disabled = state === 'disabled' || state === 'loading';
  const className = `preview-component preview-component--${definition.kind} is-${variant} is-${state}`;

  if (definition.kind === 'button') {
    return <button className={className} disabled={disabled} onClick={onAction}>{state === 'loading' ? 'Загрузка…' : label}</button>;
  }
  if (definition.kind === 'input') {
    return (
      <label className={className}>
        <span>{label}</span>
        <input placeholder={String(interpolate(merged.placeholder ?? '', fixture))} disabled={disabled} aria-invalid={state === 'error'} />
        {state === 'error' && <small>{String(merged.errorText || 'Проверьте значение')}</small>}
      </label>
    );
  }
  if (definition.kind === 'card') {
    return (
      <article
        className={className}
        onClick={onAction}
        onKeyDown={(event) => { if (onAction && (event.key === 'Enter' || event.key === ' ')) onAction(); }}
        role={onAction ? 'button' : undefined}
        tabIndex={onAction ? 0 : undefined}
      >
        <strong>{label}</strong>
        {Boolean(merged.description) && <p>{String(interpolate(merged.description, fixture))}</p>}
      </article>
    );
  }
  if (definition.kind === 'badge') return <span className={className}>{label}</span>;
  return <p className={className}>{label}</p>;
}

function LayoutSlotPlaceholder({ label, content = false }: { label: string; content?: boolean }) {
  return <div className={`layout-slot-placeholder ${content ? 'is-content' : ''}`}><span>{label}</span></div>;
}

export function LayoutPreview({
  definition,
  viewport,
  children,
}: {
  definition: LayoutDefinition;
  viewport: 'desktop' | 'mobile';
  children?: ReactNode;
}) {
  const regionIds = new Set(definition.regions.map((region) => region.id));
  const composition = regionIds.has('navigation') || regionIds.has('top-bar')
    ? 'shell'
    : regionIds.has('brand') || regionIds.has('support')
      ? 'centered'
      : 'single';

  return <section className={`layout-preview is-${viewport} is-${composition}`} aria-label={`${definition.name}, ${viewport}`}>
    {definition.regions.map((region) => <div className={`layout-preview__region region-${region.id}`} data-region={region.id} key={region.id}>
      <small>{region.name}{region.required ? '' : ' · optional'}</small>
      {region.id === 'content'
        ? children || <LayoutSlotPlaceholder label="Content" content />
        : <LayoutSlotPlaceholder label={region.name} />}
    </div>)}
  </section>;
}

export function ScreenPreview({
  studio,
  screen,
  stateId,
  viewport,
  theme,
  fixture = {},
  onAction,
  compact = false,
  zoom = 1,
}: {
  studio: StudioData;
  screen: ScreenDefinition;
  stateId: string;
  viewport: string;
  theme: Theme;
  fixture?: Record<string, unknown>;
  onAction?: (actionId: string) => void;
  compact?: boolean;
  zoom?: number;
}) {
  const state = screen.states.find((item) => item.id === stateId) || screen.states[0];
  const preset = resolveViewport(studio, viewport);
  const scale = compact ? Math.min(1, 280 / preset.width) : zoom;
  const components = new Map(studio.components.map((component) => [component.id, component]));

  return (
    <div className={`screen-frame ${compact ? 'is-compact' : ''}`} style={{ width: preset.width * scale, height: preset.height * scale }}>
      <section className="screen-preview" style={{ ...themeStyle(theme), width: preset.width, height: preset.height, transform: `scale(${scale})` }}>
        <header className="screen-preview__header">
          <span>{screen.name}</span>
          <small>{state.name}</small>
        </header>
        <div className="screen-preview__content">
          {state.title && <h1>{String(interpolate(state.title, fixture))}</h1>}
          {state.description && <p className="screen-preview__lead">{String(interpolate(state.description, fixture))}</p>}
          <div className="screen-preview__blocks">
            {state.blocks.map((block) => {
              const definition = components.get(block.componentId);
              if (!definition) return <div key={block.id} className="missing-component">Unknown: {block.componentId}</div>;
              return (
                <ComponentPreview
                  key={block.id}
                  definition={definition}
                  variant={block.variant}
                  state={block.state}
                  props={block.props}
                  fixture={fixture}
                  onAction={block.actionId && onAction ? () => onAction(block.actionId as string) : undefined}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ScreenMapNodeView({ data }: { data: { node: ScreenMapNode; studio: StudioData; theme: Theme } }) {
  const screen = data.studio.screens.find((item) => item.id === data.node.screenId);
  if (!screen) return <div className="map-node">Missing screen</div>;
  return (
    <article className="map-node">
      <Handle type="target" position={Position.Left} />
      <div className="map-node__meta"><strong>{screen.name}</strong><span>{data.node.stateId} · {data.node.viewport}</span></div>
      <PreviewErrorBoundary><ScreenPreview studio={data.studio} screen={screen} stateId={data.node.stateId} viewport={data.node.viewport} theme={data.theme} compact /></PreviewErrorBoundary>
      <Handle type="source" position={Position.Right} />
    </article>
  );
}
