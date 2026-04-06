# AI Context Rules

Репозиторий с source-of-truth структурой `ai-context` для правил и
операционного контура AI-агента.

## Базовая идея

`ai-context` в рабочем репозитории хранит только то, что нужно самому AI:

- [`ai-context/baseline`](./ai-context/baseline) - versioned baseline:
  правила, guides, templates, scripts, prompts и examples;
- локальные AI-данные внутри `ai-context/` - `tasks/`, `rules/`, `changelog/`,
  `content/` и `parameters/`.

Рабочие результаты проекта должны жить вне `ai-context`: код, `docs/`,
`specs/`, `epics/` и другие project outputs.

В режиме `project-manager` это означает:

- `ai-context/tasks/` - очередь задач самого AI;
- `epics/` в корне репозитория - backlog команды и декомпозиция работы.

Это означает:

- `ai-context/baseline/**` всегда можно детерминированно перезаписать из git;
- локальные AI-данные внутри `ai-context/` нельзя затирать при обновлении;
- project outputs вне `ai-context` тоже нельзя считать replaceable AI-слоем.

## Быстрый старт

### Для Developer

```text
Обнови или установи `ai-context` из `https://github.com/foodtechlab/ai_context_rules`.

Сначала прочитай `ai-context/baseline/update-policy.md`, затем запусти
`ai-context/baseline/scripts/sync-ai-context.py`, а после этого
`ai-context/baseline/scripts/verify-ai-context.py`.

Перезаписывать можно только `ai-context/baseline/**` и baseline-owned root
файлы. Не затирай существующие project-local файлы в `ai-context/**` вне
`baseline/`.

В `ai-context/parameters/repository-parameters.yaml` зафиксируй режим
`developer`.
```

### Для Project Manager

```text
Обнови или установи `ai-context` из `https://github.com/foodtechlab/ai_context_rules`.

Сначала прочитай `ai-context/baseline/update-policy.md`, затем запусти
`ai-context/baseline/scripts/sync-ai-context.py --mode project-manager`, а
после этого `ai-context/baseline/scripts/verify-ai-context.py --mode project-manager`.

Перезаписывать можно только `ai-context/baseline/**` и baseline-owned root
файлы. Не затирай существующие project-local файлы в `ai-context/**` вне
`baseline/` и в корневом `epics/`. В режиме `project-manager` командный backlog
ведется в `epics/`, а задачи самого AI остаются в `ai-context/tasks/`.

В `ai-context/parameters/repository-parameters.yaml` зафиксируй режим
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
  шаблоны и bootstrap-файлы AI-контура и `project-manager` backlog.
- [`ai-context/baseline/promts`](./ai-context/baseline/promts) -
  prompt-like команды.
- [`ai-context/baseline/scripts`](./ai-context/baseline/scripts) -
  deterministic sync/verify scripts.
- В рабочем проекте sync может дополнительно bootstrap-ить `epics/epic-list.md`
  в корне репозитория, если выбран режим `project-manager`.

## Быстрые точки входа

- Как разделены AI-контур и project outputs:
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
