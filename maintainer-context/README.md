# Maintainer Context

`maintainer-context/` — локальный рабочий контур разработки самого
source-of-truth репозитория `ai_context_rules`.

Он намеренно находится вне `ai-context/`, потому что не является частью
устанавливаемого AI-контура и не должен попадать в целевые репозитории даже при
ручном копировании каталога `ai-context`.

## Состав

- `tasks/task-list.md` — рабочий список задач развития source-of-truth.
- `tasks/task-details/<код>.md` — детализация этих задач.

Статусы и формат задач соответствуют
`ai-context/baseline/guides/tasks.md`, но пути из этого документа для данного
репозитория переопределяются на `maintainer-context/tasks/`.

## Граница установки

- `sync-ai-context.py` и manifest установки не читают этот каталог.
- В target repository по-прежнему используется `ai-context/tasks/`.
- Baseline templates не должны ссылаться на `maintainer-context/`.
- Repo-local задачи целевого проекта нельзя переносить сюда.
