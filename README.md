# AI Context Rules

Репозиторий с source-of-truth структурой `ai-context` для правил и
операционного контура AI-агента.

## Базовая идея

`ai-context` в рабочем репозитории хранит только то, что нужно самому AI:

- [`ai-context/baseline`](./ai-context/baseline) - versioned baseline:
  правила, repository skills, AI Context Apps, guides, scripts, prompts и
  examples;
- локальные AI-данные внутри `ai-context/` - `tasks/`, `rules/`, `changelog/`,
  `apps/`, `content/`, `mcp/`, `skills/imports/` и `parameters/`.

Продуктовый код и рабочие результаты проекта должны жить вне `ai-context`:
`docs/`, `specs/`, `epics/` и другие project outputs.

В режиме `project-manager` это означает:

- `ai-context/tasks/` - очередь задач самого AI, их детализация и архив;
- `epics/` в корне репозитория - backlog команды и декомпозиция работы.

Это означает:

- `ai-context/baseline/**` всегда можно детерминированно перезаписать из git;
- локальные AI-данные внутри `ai-context/` нельзя затирать при обновлении;
- project outputs вне `ai-context` тоже нельзя считать replaceable AI-слоем.

## Быстрый старт

### Repository skills

После установки `ai-context` достаточно написать:

```text
установи скилы
```

или:

```text
установи скиллы из ai-context
```

AI возьмет свежий набор из source-of-truth, установит его только в
`.agents/skills/` текущего репозитория и обновит ранее установленные `aic-*`
skills.

### Backend Entity Map

После установки зависимостей приложение запускается из корня репозитория:

```bash
npm --prefix ai-context/baseline/apps/backend-entity-map install
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/backend-entity-map run dev
```

AI-generated данные обновляет `$aic-collect-backend-entities`, а
пользовательские данные и layout сохраняются интерфейсом в repo-local
`ai-context/apps/backend-entity-map/data/user.json`.

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

- [`maintainer-context/`](./maintainer-context) - задачи разработки самого
  source-of-truth репозитория; этот каталог не входит в устанавливаемый
  `ai-context` и не переносится в целевые репозитории.
- [`ai-context/README.md`](./ai-context/README.md) - обзор двухслойной модели.
- [`ai-context/baseline/README.md`](./ai-context/baseline/README.md) - состав
  baseline и ownership-правило.
- [`ai-context/baseline/update-policy.md`](./ai-context/baseline/update-policy.md) -
  политика установки и обновления.
- [`ai-context/baseline/ai-rules`](./ai-context/baseline/ai-rules) -
  постоянные межпроектные правила.
- [`ai-context/baseline/rules`](./ai-context/baseline/rules) -
  versioned наборы технических правил, перенесенные в baseline для повторного
  использования.
- [`ai-context/baseline/skills`](./ai-context/baseline/skills) - канонические
  repository skills и manifest их установки.
- [`ai-context/baseline/apps`](./ai-context/baseline/apps) - переносимые
  AI Context Apps, templates и schemas.
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

- Задачи разработки этого source-of-truth репозитория:
  [`maintainer-context/tasks/task-list.md`](./maintainer-context/tasks/task-list.md)
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
- Как устроен repo-local контур MCP:
  [`ai-context/baseline/guides/mcp.md`](./ai-context/baseline/guides/mcp.md)
- Как импортировать, публиковать, устанавливать и обновлять skills:
  [`ai-context/baseline/guides/skills.md`](./ai-context/baseline/guides/skills.md)
- Как размещать AI Context Apps:
  [`ai-context/baseline/guides/apps.md`](./ai-context/baseline/guides/apps.md)
- Как устроен `project-manager` backlog:
  [`ai-context/baseline/guides/epics.md`](./ai-context/baseline/guides/epics.md)

## Статус

Репозиторий развивается как source-of-truth для `ai-context` с детерминированным
baseline-sync и жесткой границей между шаблонным слоем и живыми данными
рабочего репозитория.
