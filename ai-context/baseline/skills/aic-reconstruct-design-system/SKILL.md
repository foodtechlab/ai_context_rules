---
name: aic-reconstruct-design-system
description: Анализировать существующее приложение внутри текущего репозитория и создавать полный детализированный task-list для пошагового восстановления его дизайн-системы в AIC Design System Studio. Использовать для Flutter, iOS, Android, Web и смешанных UI-проектов, когда пользователь указывает директорию приложения и хочет сначала получить задачи, а не немедленно менять дизайн-систему.
---

# Восстановление дизайн-системы из приложения

Построить evidence-based план переноса существующего UI в project-owned Design
System Studio. Этот skill выполняет discovery и декомпозицию, но не реализует
задачи восстановления в том же запуске.

## Обязательный вход

Пользователь должен передать путь до внутренней директории приложения, из
которой нужно восстановить дизайн-систему.

Если путь не передан, запросить только его и остановиться до получения ответа.
Не выбирать приложение самостоятельно.

После получения пути:

1. Определить корень репозитория через `git rev-parse --show-toplevel`.
2. Разрешить относительный путь от корня репозитория; абсолютный путь допустим,
   только если после разрешения он находится внутри того же репозитория.
3. Проверить существование директории и исключить symlink escape.
4. Если внутри выбранной директории находятся несколько самостоятельных
   приложений, запросить более конкретный путь вместо объединения продуктов.

Выбранная директория является read-only source evidence. Не менять product
code, resources, generated files или build configuration.

## Подготовка

Полностью прочитать:

- `ai-context/baseline/apps/design-system-studio/README.md`;
- `ai-context/baseline/apps/design-system-studio/docs/project-structure.md`;
- `ai-context/baseline/apps/design-system-studio/schemas/studio.schema.json`;
- `ai-context/baseline/apps/design-system-studio/schemas/project.schema.json`;
- `ai-context/baseline/guides/tasks.md`;
- `ai-context/baseline/templates/task-details.md`;
- `ai-context/parameters/repository-parameters.yaml`.

Прочитать [platform-discovery.md](references/platform-discovery.md) и выбрать
разделы только для обнаруженных платформ. Перед созданием задач прочитать
[task-blueprint.md](references/task-blueprint.md).

Определить project-owned design-system directory по repository parameters и
правилам `aic-design-system-studio`. Если директория ещё не создана, не
bootstrap-ить её в этом запуске: включить bootstrap отдельной первой задачей.

## Пошаговый анализ

Сначала завершить inventory целиком, затем записывать task-list. Нельзя
создавать задачи по первым найденным файлам, пока не проверены повторное
использование, навигация и оставшиеся source roots.

### 1. Определить платформу и границы

- Найти manifests, source roots, resource catalogs, targets/modules и UI
  frameworks.
- Зафиксировать platform, application id/target, поддерживаемые темы, form
  factors и локализации.
- Исключить dependencies, generated code, caches, build output, snapshots и
  vendor directories согласно platform reference.

### 2. Собрать foundations

Найти с точными source paths:

- базовую платформенную дизайн-систему и UI libraries;
- palettes, semantic colors и themes;
- font families, weights, text styles и dynamic type/scaling;
- spacing, sizes, grids, breakpoints, radii, borders, elevation, opacity,
  motion и z-order;
- icons, images и другие повторно используемые visual assets.

Различать фактические shared definitions и повторяющиеся literals. Вторые
считать кандидатами, указывать количество и evidence, но не объявлять готовыми
tokens без проверки.

### 3. Собрать UI inventory

Пройти все UI source roots и составить полный список:

- переиспользуемых primitives/components;
- составных компонентов и feature widgets/views;
- повторно используемых layouts/templates/navigation shells;
- экранов/pages/view controllers и их состояний;
- routes, deep links, transitions и пользовательских flows;
- preview/sample/test fixtures, из которых можно восстановить mockups.

Для каждого элемента сохранить proposed stable id, kind, source paths,
dependencies, variants, states, inputs/actions, accessibility evidence,
responsive behavior и confidence. Один source file может содержать несколько
элементов, а один элемент может подтверждаться несколькими файлами.

Не считать файл отдельным design-system элементом только из-за его наличия.
Классифицировать по назначению и повторному использованию.

### 4. Проверить покрытие

Перед записью задач сверить inventory минимум по трём независимым индексам:

- все UI declarations в source roots;
- вся navigation/route graph;
- все shared resources/themes/assets.

Отметить orphan screens, dynamic routes, runtime-generated UI, неизвестные
states и платформенные реализации без общего аналога. Не заполнять пробелы
догадками: переносить их в `openQuestions` и criteria соответствующей задачи.

## Создание задач

Работать только с project-owned:

- `ai-context/tasks/task-list.md`;
- `ai-context/tasks/task-details/<code>.md`.

Создать задачи в dependency order из `task-blueprint.md`. Для каждого
обнаруженного design-system элемента создать отдельную задачу и сразу отдельный
detail-файл. Не объединять несколько компонентов, layouts, screens или flows в
одну задачу ради сокращения списка.

Foundation и tokens допускают отдельные задачи по связному набору значений
(например palette, typography scale, spacing scale), но не одну общую задачу
«создать все tokens». Themes с самостоятельными overrides планировать
отдельно.

Каждая новая строка сразу получает статус `🟠`, потому что detail создаётся в
том же запуске:

```text
🟠 [<code>] Восстановить <kind> <name> из <app>
```

Коды выделять по `tasks.md`, проверив task-list, details и archive. Не менять
статус существующих задач. В каждый detail добавить устойчивый marker:

```html
<!-- aic-design-reconstruction: source=<repo-relative-app-path>; kind=<kind>; id=<stable-id> -->
```

Marker нужен для повторного запуска:

- переиспользовать найденную задачу, а не создавать дубликат;
- обновлять detail только пока задача `🔴` или `🟠` и изменения не стирают
  пользовательские решения;
- не переписывать задачи `🟡`, `🟣` или `🟢`; описать обнаруженный drift в
  итоговом отчёте и при необходимости создать отдельную follow-up задачу;
- не удалять задачи автоматически, если source element исчез.

Detail должен быть исполним независимо: включать source evidence, точный
отдельный target-файл `<id>.json`, зависимости от других task codes, конкретные шаги,
states/variants, вопросы и проверяемые criteria. Нельзя оставлять формулировки
«проанализировать позже» вместо уже доступного evidence.

После создания backlog не запускать ни одну созданную задачу. Пользователь
выбирает и запускает их отдельно для качественного выполнения.

## Проверка результата

До завершения проверить:

- каждая строка `🟠` имеет ровно один существующий detail-файл;
- marker уникален, task codes не повторяются;
- каждый inventory element покрыт задачей или явно записан как unresolved;
- dependencies не ссылаются на неизвестные task codes и не образуют цикл;
- задачи отсортированы: bootstrap/base → tokens/themes → components → layouts
  → screens → flows → mockups → интеграционная проверка;
- product directory и project-owned design-system files не изменены этим
  planning-запуском.

Каждая element-задача обязана создавать или изменять ровно один definition-
файл своей сущности. Нельзя планировать запись components, layouts, screens,
flows или mockups в общий JSON. `design-system.json` не является контейнером
сущностей, а legacy `studio.json` не является допустимой целью.

## Результат

Сообщить:

- resolved source directory и обнаруженные platform/targets;
- design-system target directory;
- количество найденных foundations, token sets, components, layouts, screens,
  flows и mockups;
- диапазон созданных и переиспользованных task codes;
- unresolved areas и причины низкой confidence;
- рекомендуемый первый task code для следующего запуска.

Не делать commit или push без явного запроса пользователя.
