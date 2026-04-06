# AI Context

`ai-context` теперь разделен на два явных слоя:

- `baseline/` - source-of-truth слой, который тянется из git и может целиком
  перезаписываться при синхронизации;
- `workspace/` - локальный рабочий слой конкретного репозитория, который имеет
  приоритет над шаблоном и не должен затираться baseline-sync.

Такой split убирает двусмысленность: baseline содержит только правила,
шаблоны, скрипты и examples, а живая работа проекта хранится отдельно.

## Состав

- `baseline/ai-rules/` - постоянные межпроектные правила поведения AI-агента.
- `baseline/guides/` - baseline-документы о workflow, task-flow, changelog,
  rules, parameters и `project-manager` режиме.
- `baseline/templates/` - шаблоны для task details, repository parameters и
  bootstrap-файлы для `workspace/`.
- `baseline/promts/` - переиспользуемые prompt-like команды.
- `baseline/scripts/` - deterministic sync/verify и обязательные служебные
  утилиты.
- `baseline/examples/` - примеры контуров `rules` и `epics`, которые нельзя
  считать живыми рабочими данными проекта.
- `workspace/tasks/` - живая очередь задач AI и их детализация.
- `workspace/rules/` - project-specific архитектурные и предметные правила.
- `workspace/changelog/` - append-only журнал фактических изменений.
- `workspace/content/` - проектные markdown-артефакты и supporting-материалы.
- `workspace/parameters/` - repository-level и local-machine-level параметры
  конкретного репозитория.
- `workspace/epics/` - backlog команды в режиме `project-manager`.

Имя директории `promts` сохранено для совместимости с уже существующими
репозиториями.

## Правило владения

- Любой файл внутри `ai-context/baseline/` принадлежит source-of-truth и при
  синхронизации может быть удален, заново создан или перезаписан.
- Любой файл внутри `ai-context/workspace/` принадлежит конкретному
  репозиторию. Sync-скрипты могут создать такой файл только если его еще нет,
  но не должны перезаписывать существующее локальное содержимое.
- Если проекту нужна кастомизация, она делается только через `workspace/`, а не
  через ручные правки в `baseline/`.

## Рабочий цикл

1. Перед реализацией подними применимые файлы из `baseline/ai-rules/`,
   `baseline/guides/` и `workspace/rules/`.
2. Для задачи AI работай через `workspace/tasks/task-list.md` и
   `workspace/tasks/task-details/<код>.md`.
3. Для командного backlog в режиме `project-manager` используй
   `workspace/epics/`.
4. После file changes добавь запись в `workspace/changelog/`.
5. После завершения задачи переведи ее в `🟣`, покажи алерт через
   `baseline/scripts/show-completion-alert.sh` и подготовь резюме для коммита.
6. Только пользователь после ручной проверки переводит задачу в `🟢`.

## Установка и обновление

Source-of-truth репозиторий:

- `https://github.com/foodtechlab/ai_context_rules`

Брать baseline нужно из основной ветки:

- `main`, если она существует;
- `master`, если основной веткой остается она.

Обязательный порядок:

1. прочитать `ai-context/baseline/update-policy.md`;
2. запустить `ai-context/baseline/scripts/sync-ai-context.py`;
3. проверить результат через `ai-context/baseline/scripts/verify-ai-context.py`.

Подробности по устройству baseline-слоя описаны в
`ai-context/baseline/README.md`.
