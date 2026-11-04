# ADR-001: Platform-neutral model and reference renderers

## Status

Accepted for MVP.

## Context

React code can render a browser preview, but it cannot be copied directly into
Flutter, Jetpack Compose or SwiftUI without losing semantics and platform
behavior. At the same time, the studio must remain code-first, versioned and
usable without a cloud service.

## Decision

- Project-owned entity files are the canonical, serializable and versioned
  contract. Every entity has its own `<id>.json`; `design-system.json` contains
  only project-wide metadata and settings.
- The Studio aggregate exists only in memory and is never a canonical file.
- React is the editor and reference Web renderer, not the cross-platform source.
- The model has seven required sections: base system, tokens, components,
  layouts, screens, flows and mockups.
- Tokens follow base → semantic → component references.
- Components are classified as atoms, molecules or organisms and registered by
  a controlled `kind`; JSON never executes code.
- Screens compose registered components inside reusable layouts.
- Flows connect named actions and optional conditions to target screen states.
- Mockups run flows with deterministic fixtures and mark simulated behavior.
- Platform adapters read the model and write generated files into explicit
  generated boundaries. They never mutate handwritten product code.
- Platform fidelity is reported through a capability matrix.

## Consequences

- Data can be reviewed in git and survives runtime updates.
- The MVP supports a deliberately small component vocabulary.
- Product teams extend renderer registries and adapters explicitly.
- Native parity still requires platform review for layout, navigation,
  accessibility and performance.
