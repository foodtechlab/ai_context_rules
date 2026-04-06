# AI Context Rules

Репозиторий с source-of-truth структурой `ai-context`, в которой baseline и
локальный workspace разделены физически.

## Базовая идея

`ai-context` теперь состоит из двух частей:

- [`ai-context/baseline`](./ai-context/baseline) - только versioned baseline:
  правила, guides, templates, scripts, prompts и examples;
- [`ai-context/workspace`](./ai-context/workspace) - только локальные рабочие
  данные конкретного репозитория.

Это означает:

- `baseline` всегда можно детерминированно перезаписать из git;
- `workspace` всегда имеет локальный приоритет и не должен затираться при
  обновлении;
- mixed-directories вроде старой схемы `tasks/README.md + tasks/task-list.md`
  больше не используются.

## Быстрый старт

### Для Developer

```text
Обнови или установи `ai-context` из `https://github.com/foodtechlab/ai_context_rules`.

Сначала прочитай `ai-context/baseline/update-policy.md`, затем запусти
`ai-context/baseline/scripts/sync-ai-context.py`, а после этого
`ai-context/baseline/scripts/verify-ai-context.py`.

Перезаписывать можно только `ai-context/baseline/**` и baseline-owned root
файлы. `ai-context/workspace/**` не затирай: там живут backlog, task-details,
changelog, project-specific rules, repository parameters, team epics и local
секреты.

В `ai-context/workspace/parameters/repository-parameters.yaml` зафиксируй режим
`developer`.
```

### Для Project Manager

```text
Обнови или установи `ai-context` из `https://github.com/foodtechlab/ai_context_rules`.

Сначала прочитай `ai-context/baseline/update-policy.md`, затем запусти
`ai-context/baseline/scripts/sync-ai-context.py --mode project-manager`, а
после этого `ai-context/baseline/scripts/verify-ai-context.py --mode project-manager`.

Перезаписывать можно только `ai-context/baseline/**` и baseline-owned root
файлы. `ai-context/workspace/**` не затирай. В режиме `project-manager`
командный backlog ведется в `ai-context/workspace/epics/`, а задачи самого AI
остаются в `ai-context/workspace/tasks/`.

В `ai-context/workspace/parameters/repository-parameters.yaml` зафиксируй режим
`project-manager`.
```

## Что здесь лежит

- [`ai-context/README.md`](./ai-context/README.md) - обзор двухслойной модели.
- [`ai-context/baseline/README.md`](./ai-context/baseline/README.md) - состав
  baseline и ownership-правило.
- [`ai-context/baseline/update-policy.md`](./ai-context/baseline/update-policy.md) -
  политика установки и обновления.
- [`ai-context/baseline/ai-rules`](./ai-context/baseline/ai-rules) -
  постоянные межпроектные правила.
- [`ai-context/baseline/guides`](./ai-context/baseline/guides) -
  baseline-guides для workflow.
- [`ai-context/baseline/templates`](./ai-context/baseline/templates) -
  шаблоны и bootstrap-файлы workspace.
- [`ai-context/baseline/promts`](./ai-context/baseline/promts) -
  prompt-like команды.
- [`ai-context/baseline/scripts`](./ai-context/baseline/scripts) -
  deterministic sync/verify scripts.
- [`ai-context/workspace`](./ai-context/workspace) - локальные рабочие данные
  этого репозитория.

## Быстрые точки входа

- Как устроен split baseline/workspace:
  [`ai-context/README.md`](./ai-context/README.md)
- Как обновлять baseline:
  [`ai-context/baseline/promts/update-ai-context-prompt.md`](./ai-context/baseline/promts/update-ai-context-prompt.md)
- Как устанавливать baseline:
  [`ai-context/baseline/promts/install-or-update-ai-context-prompt.md`](./ai-context/baseline/promts/install-or-update-ai-context-prompt.md)
- Как работать с задачами:
  [`ai-context/baseline/guides/tasks.md`](./ai-context/baseline/guides/tasks.md)
- Как устроены параметры:
  [`ai-context/baseline/guides/parameters.md`](./ai-context/baseline/guides/parameters.md)
- Как устроен `project-manager` backlog:
  [`ai-context/baseline/guides/epics.md`](./ai-context/baseline/guides/epics.md)

## Статус

Репозиторий развивается как source-of-truth для `ai-context` с детерминированным
baseline-sync и жесткой границей между шаблонным слоем и живыми данными
рабочего репозитория.
