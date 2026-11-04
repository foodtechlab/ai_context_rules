# ADR-001: Platform-neutral model and reference renderers

## Status

Accepted for MVP.

## Context

React code can render a browser preview, but it cannot be copied directly into
Flutter, Jetpack Compose or SwiftUI without losing semantics and platform
behavior. At the same time, the studio must remain code-first, versioned and
usable without a cloud service.

## Decision

- `studio.json` is the canonical, serializable and versioned contract.
- React is the editor and reference Web renderer, not the cross-platform source.
- Components are registered by a controlled `kind`; JSON never executes code.
- Screens compose registered components and attach named actions.
- Screen maps connect named actions to target nodes.
- Platform adapters read the model and write generated files into explicit
  generated boundaries. They never mutate handwritten product code.
- Platform fidelity is reported through a capability matrix.

## Consequences

- Data can be reviewed in git and survives runtime updates.
- The MVP supports a deliberately small component vocabulary.
- Product teams extend renderer registries and adapters explicitly.
- Native parity still requires platform review for layout, navigation,
  accessibility and performance.
