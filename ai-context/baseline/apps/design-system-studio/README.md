# Design System Studio

Code-first React-приложение для design tokens, каталога компонентов, экранов,
React Flow-карт и интерактивных mockup-сценариев.

## Ownership

- Runtime, schemas, reference renderers и adapters находятся в replaceable
  `ai-context/baseline/apps/design-system-studio/`.
- Дизайн текущего репозитория находится в repo-local
  `ai-context/apps/design-system-studio/data/studio.json`.
- Baseline-sync обновляет runtime и не перезаписывает существующий `studio.json`.

## Запуск

Из корня целевого репозитория:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio install
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

Открыть `http://localhost:4174`.

Проверки:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio run typecheck
npm --prefix ai-context/baseline/apps/design-system-studio test
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/design-system-studio run validate:data
npm --prefix ai-context/baseline/apps/design-system-studio run build
```

Production-like запуск:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio run build
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/design-system-studio start
```

Порт меняется через `PORT`.

## Модель

`studio.json` содержит versioned platform-neutral модель:

- themes и semantic tokens;
- components, variants, states и accessibility metadata;
- screens, screen states, blocks и viewport presets;
- React Flow screen maps и именованные transitions;
- prototype fixtures;
- adapter settings.

При чтении и записи модель проходит последовательный migration layer. Текущая
версия — `schemaVersion: 1`; данные из будущей неизвестной версии отклоняются,
а не понижаются молча. Новая миграция добавляется в registry в
`src/data-model.mjs` и покрывается тестом.

Изменения из UI атомарно сохраняются в repo-local файл. JSON-редактор остается
code-first escape hatch и проходит reference validation перед записью.

## Platform adapters

- Web/React — reference renderer и CSS tokens export.
- Flutter — proof-of-concept Dart token export.
- Android/Compose — proof-of-concept Kotlin token export.
- iOS/SwiftUI — proof-of-concept Swift token export.

Adapters не обещают автоматический production parity. Граница и последствия
описаны в `docs/adr-001-portable-model.md`.

## Безопасность

- JSON не выполняется через `eval`.
- Runtime пишет только в фиксированный app data path.
- Ошибочные references блокируют запись и возвращают диагностику.
- Product runtime не зависит от studio и не включает его в production bundle.
