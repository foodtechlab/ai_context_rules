# Design System Studio Data

Repo-local source of truth для Design System Studio.

- `data/studio.json` хранит tokens, компоненты, экраны, карты и mockup-сценарии.
- Файл изменяется через Studio или вручную как code-first JSON.
- Baseline-sync не должен перезаписывать существующий файл.
- Перед commit рекомендуется запустить `validate:data`, `typecheck`, tests и build.

Runtime находится в `ai-context/baseline/apps/design-system-studio/`.
