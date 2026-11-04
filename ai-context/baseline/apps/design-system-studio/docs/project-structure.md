# Project Design System Structure

## Ownership boundary

`ai-context/baseline/apps/design-system-studio/` is an immutable runtime and
library delivered by AI Context. A target repository must never place product
tokens, components, layouts, screens, flows or mocks there.

The project implementation lives outside `ai-context/baseline` in a directory
whose last segment is `design-system`, for example:

```text
apps/mobile/design-system/
  studio.json
  README.md
  base-system/
  tokens/
    colors/
    typography/
    parameters/
  components/
    atoms/
    molecules/
    organisms/
  layouts/
  screens/
  flows/
  mockups/
```

The prefix (`apps/mobile` in the example) belongs to the target repository and
is configured as `design_system_studio.project_directory` in
`ai-context/parameters/repository-parameters.yaml`.

The production/project convention requires the final segment `design-system`.
Named repository examples are the only exception and may use
`examples/design-system-<name>` so several isolated examples can coexist.

## Responsibilities

- `studio.json` is the canonical index: stable ids, cross-section references,
  states, fixtures and adapter settings.
- The seven section directories contain project-owned documentation, source
  implementations, tests, examples and assets for their section.
- `components/atoms`, `components/molecules` and `components/organisms` contain
  the actual project component implementations. They are not added to the
  baseline runtime.
- `tokens/colors`, `tokens/typography` and `tokens/parameters` preserve the
  token grouping. Base, semantic and component tiers remain explicit in files
  or subdirectories chosen by the project.
- Missing decisions stay visible in `openQuestions` in `studio.json` and in the
  corresponding section documentation.

## Using the baseline library

The project directory consumes the runtime/library from
`ai-context/baseline/apps/design-system-studio`; it does not copy or fork it.
The Studio process receives the project path explicitly:

```bash
AIC_DESIGN_SYSTEM_DIR="apps/mobile/design-system" \
  npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

For a JavaScript or TypeScript design-system package, add a local file
dependency whose relative path resolves to the baseline package:

```json
{
  "devDependencies": {
    "@ai-context/design-system-studio": "file:../../../ai-context/baseline/apps/design-system-studio"
  }
}
```

The exact relative prefix depends on the selected project directory. Flutter,
Android and iOS projects use `studio.json`, generated adapters and the same
seven-section ownership model instead of importing React source into product
runtime.

## Update rule

AI Context updates may replace every file under
`ai-context/baseline/apps/design-system-studio/`. They must not create, edit,
move or delete the project `…/design-system/` directory. Project changes must
never be implemented by patching baseline files.

Legacy `ai-context/apps/design-system-studio/data/studio.json` is not a valid
project location under this standard. Move it once into the selected project
directory, validate the new location, and only then retire the legacy copy.
