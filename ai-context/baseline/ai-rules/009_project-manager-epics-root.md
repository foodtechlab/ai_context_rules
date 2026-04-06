# Правило 009: В режиме `project-manager` командные эпики живут в `workspace/epics/`

## Статус

Действует.

## Правило

Если в `ai-context/workspace/parameters/repository-parameters.yaml` выбран
режим `project-manager`, нужно разделять два разных контура:

- `ai-context/workspace/tasks/` - задачи, которые должен выполнить сам AI-агент;
- `ai-context/workspace/epics/` - задачи и эпики для команды, которые
  руководитель проекта готовит, декомпозирует и передает дальше.

В этом режиме AI не должен смешивать backlog команды с собственной очередью в
`ai-context/workspace/tasks/`, если пользователь явно не попросил об ином.

## Правило поставки из source-of-truth

Директория `ai-context/baseline/examples/epics/` в этом репозитории
(`https://github.com/foodtechlab/ai_context_rules`) не является живым backlog
команды. Здесь она существует как baseline-документация и пример структуры.

При переносе `ai-context` в реальный проект агент должен:

- создавать `workspace/epics/` только если в целевом проекте выбран режим
  `project-manager`;
- использовать `baseline/examples/epics/` только как reference и source для
  bootstrap `epic-list.md`, если его еще нет;
- не считать `_example/` рабочими эпиками проекта;
- создавать или сохранять `workspace/epics/epic-list.md` и реальные директории эпиков
  как project-local данные целевого репозитория.

## Базовая структура

Рекомендуемая структура `ai-context/workspace/epics/`:

```text
ai-context/workspace/epics/
  epic-list.md
  <код>/
    <код>-epic.md
    <код>.md
    context/
```

Где:

- `workspace/epics/epic-list.md` - короткий список эпиков;
- `workspace/epics/<код>/<код>-epic.md` - основная постановка эпика;
- `workspace/epics/<код>/<код>.md` - декомпозиция на задачи для команды;
- `workspace/epics/<код>/context/` - supporting-материалы, схемы и заметки.

## Практический смысл

Такое разделение позволяет:

- не смешивать операционные задачи AI и backlog команды;
- хранить крупные управленческие инициативы отдельно от AI task-flow;
- упростить handoff от руководителя проекта к разработке, аналитике и дизайну.
