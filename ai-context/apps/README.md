# AI Context Apps

Этот repo-local каталог предназначен для запускаемых приложений, которые
помогают исследовать, визуализировать и использовать контекст текущего
репозитория.

Каждое приложение размещается в отдельном каталоге:

```text
ai-context/apps/<app-name>/
```

Правила именования, минимальный контракт и ownership описаны в
`ai-context/baseline/guides/apps.md`.

## Приложения

- `backend-entity-map/` — repo-local данные карты backend-сущностей; runtime
  приложения находится в `ai-context/baseline/apps/backend-entity-map/`.
Design System Studio является исключением: его проектные данные и реализации
лежат вне `ai-context/apps`, в настраиваемой директории вида
`<project-path>/design-system/`. В `ai-context` хранится только неизменяемый
runtime/library: `ai-context/baseline/apps/design-system-studio/`.
