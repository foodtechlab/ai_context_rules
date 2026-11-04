# Design System Studio Data

Repo-local source of truth для Design System Studio.

- `data/studio.json` хранит семь обязательных разделов: базовую систему, tokens,
  компоненты, layouts, экраны, flows и mockups.
- Недостающие решения явно фиксируются в `openQuestions`.
- Файл изменяется через Studio или вручную как code-first JSON.
- Baseline-sync не должен перезаписывать существующий файл.
- Перед commit рекомендуется запустить `validate:data`, `typecheck`, tests и build.

Runtime находится в `ai-context/baseline/apps/design-system-studio/`.
