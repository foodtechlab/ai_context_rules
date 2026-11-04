# AI Context Apps Guide

`apps` — стандартная зона для запускаемых приложений, которые помогают
человеку или AI исследовать, визуализировать и использовать контекст текущего
репозитория.

## Назначение

В `ai-context/apps/` размещаются только AI-operational приложения:

- они работают с кодом, метаданными или AI-артефактами текущего репозитория;
- могут использовать данные, подготовленные или обновляемые AI;
- предоставляют интерактивный интерфейс, а не заменяют baseline scripts или
  skills;
- не являются частью основного продукта и его runtime.

Приложения продукта, библиотеки и обычные сервисы должны оставаться вне
`ai-context`.

## Структура

```text
ai-context/
  baseline/
    apps/
  apps/
    README.md
    <app-name>/
```

- `ai-context/baseline/apps/` — replaceable source-of-truth зона переносимых
  приложений, app templates и общих schemas.
- `ai-context/apps/` — repo-local зона приложений текущего репозитория.
- `ai-context/apps/<app-name>/` — корень одного приложения.

Текущий baseline-набор:

- `backend-entity-map` — React Flow-интерфейс карты backend-сущностей.
- `design-system-studio` — неизменяемые runtime/library для проектной
  code-first дизайн-системы, расположенной в `<project-path>/design-system/`.

## Именование

- Имя директории приложения должно быть коротким и отражать его функцию.
- Использовать lowercase kebab-case: `<app-name>`.
- Не добавлять префикс `aic-`: контекст уже задан родительским каталогом
  `ai-context/apps/`.
- Не включать framework в имя, если framework не определяет назначение
  приложения.

## Минимальный контракт приложения

Каждое приложение должно иметь собственный `README.md`, в котором
зафиксированы:

- назначение и граница ответственности;
- источники входных данных;
- создаваемые или изменяемые данные;
- команда запуска;
- требования к окружению;
- какие файлы поддерживает AI, а какие редактирует человек.

Внутренняя структура определяется потребностями приложения. Допустимы
каталоги для исходного кода, данных и schemas, а также repo-specific config,
но пустые каталоги заранее не создаются и единый framework не навязывается.

## Ownership и обновление

- `baseline/apps/**` принадлежит source-of-truth и заменяется baseline-sync.
- `ai-context/apps/**` принадлежит текущему репозиторию и не
  перезаписывается baseline-sync.
- Baseline templates могут bootstrap-ить только отсутствующие README и
  начальные data-файлы, явно перечисленные в baseline manifest.
- Код baseline-приложения обновляется вместе с baseline. Его repo-local data
  после bootstrap сохраняется без перезаписи.
- Каждое приложение обязано явно разделять baseline runtime и repo-local data.

### Особое правило Design System Studio

Design System Studio не хранит проектную дизайн-систему в
`ai-context/apps/design-system-studio/`:

- `ai-context/baseline/apps/design-system-studio/` — только неизменяемые
  runtime, library, schema, adapters и templates;
- `<project-path>/design-system/` — проектные tokens, компоненты, layouts,
  screens, flows и mockups;
- путь `<project-path>/design-system` задаётся в
  `apps.catalog.design_system_studio.project_directory` файла
  `ai-context/parameters/repository-parameters.yaml`;
- локальная директория обязана повторять семь разделов модели и дополнительно
  делить tokens на три группы, а components — на atoms, molecules и organisms;
- AI Context sync не управляет проектной директорией и никогда её не
  перезаписывает.
- При bootstrap AI создаёт или обновляет VS Code-конфигурацию
  `AIC: design-system-studio` с literal repo-relative project path. Один `F5`
  обязан выполнить установку зависимостей, запуск Studio и открытие браузера;
  runtime не должен запрашивать путь интерактивно во время запуска.

Подробный layout и способ подключения baseline library описаны в
`ai-context/baseline/apps/design-system-studio/docs/project-structure.md`.
