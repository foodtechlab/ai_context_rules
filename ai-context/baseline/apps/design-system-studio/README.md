# Design System Studio

Code-first React-приложение для семи связанных разделов дизайн-системы:
базовая система, tokens, компоненты, layouts, экраны, flows и mockups.

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

`studio.json` содержит обязательную versioned platform-neutral модель:

- base design system, её версию, наследуемые решения и overrides;
- базовые, семантические и компонентные tokens по цветам, типографике и
  остальным параметрам;
- atoms, molecules и organisms с зависимостями, states и accessibility;
- reusable layouts с regions, navigation, scroll и responsive rules;
- screens и применимые screen states;
- React Flow flows с условиями, ветвлениями и recovery;
- воспроизводимые mockups с fixtures и границей implemented/simulated;
- adapter settings.

Текущий формат — `schemaVersion: 1`. Migration layer пока отсутствует: до
первого стабильного релиза структура v1 изменяется напрямую. JSON с другим
номером версии отклоняется валидацией.

Связи валидируются в направлении base system → tokens/components → layouts →
screens → flows → mockups. Неопределённые решения сохраняются в
`openQuestions`, а не замалчиваются и не заполняются догадками.

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
