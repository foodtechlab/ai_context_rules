# Project Design System Structure

## Ownership boundary

`ai-context/baseline/apps/design-system-studio/` is an immutable runtime and
library delivered by AI Context. Product data and implementations always live
outside `ai-context/baseline` in one or more named project-owned directories
under the repository root `design-system/`.

## Mandatory file layout

```text
design-system/mobile/
  design-system.json
  base-system/
    base-system.json
  tokens/
    themes/<theme-id>.json
    colors/{base,semantic,component}/<token-id>.json
    typography/{base,semantic,component}/<token-id>.json
    parameters/{base,semantic,component}/<token-id>.json
  components/
    atoms/<component-id>.json
    molecules/<component-id>.json
    organisms/<component-id>.json
  layouts/<layout-id>.json
  screens/<screen-id>.json
  flows/<flow-id>.json
  mockups/<mockup-id>.json
```

This is a strict storage contract:

- one theme, token, component, layout, screen, flow or mockup equals one JSON
  file;
- the filename must be exactly `<id>.json` and ids must be portable filenames;
- a file contains one object, never an array or collection of entities;
- `design-system.json` contains only schema version, metadata, Studio settings
  and adapter settings; entity collections are forbidden there;
- `base-system/base-system.json` is the single definition of the inherited base
  system;
- `studio.json` is legacy and is rejected by the runtime;
- implementation source, tests, stories and assets may sit beside definitions,
  but every implementation entity must also keep its own source file. Barrel
  files may only re-export and must not contain several implementations.

Studio aggregates these files only in memory for validation and rendering. A
save operation decomposes the aggregate again and atomically writes each entity
to its own project-owned file. The aggregate API payload is not a storage
format.

## Responsibilities

- `design-system.json` stores project-wide metadata, viewport presets and
  adapter settings.
- Every entity file stores stable ids, states and cross-section references for
  exactly one entity.
- The seven section directories contain project-owned definitions,
  implementations, tests, examples and assets.
- `components/atoms`, `components/molecules` and `components/organisms` contain
  the actual project component implementations; they are never added to the
  baseline runtime.
- Missing decisions remain visible in the corresponding entity's
  `openQuestions`.

The project prefix is configured as
`apps.catalog.design_system_studio.project_directory` in
`ai-context/parameters/repository-parameters.yaml`.

## Using the baseline library

The project consumes the runtime from
`ai-context/baseline/apps/design-system-studio`; it does not copy or fork it:

```bash
AIC_DESIGN_SYSTEM_DIR="design-system/mobile" \
  npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

For JavaScript or TypeScript, a project package may use a local dependency:

```json
{
  "devDependencies": {
    "@ai-context/design-system-studio": "file:../../ai-context/baseline/apps/design-system-studio"
  }
}
```

Flutter, Android and iOS use the same project files and generated adapters;
they do not import the React runtime into the product.

## One-click VS Code launch

Repository setup resolves the project directory once and persists it in
repository parameters and `.vscode/launch.json`. The configuration
`AIC: design-system-studio` must perform install → start → open browser with one
`F5`, use a literal `AIC_DESIGN_SYSTEM_DIR`, preserve unrelated configurations
and never prompt for the path at runtime.

## Update and conversion rule

AI Context updates may replace every baseline runtime file but must never edit
or delete any project `design-system/<id>/` directory.

If a pre-standard project still has `studio.json`, split it once with:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio run split:data -- \
  design-system/<id>
```

The command validates the aggregate, writes all separate files, verifies the
result and only then removes the legacy file. Never create a new `studio.json`.
