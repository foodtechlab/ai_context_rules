# AI Context

`ai-context` - это операционный контур AI-агента внутри репозитория. Здесь
живут правила, шаблоны и локальные AI-артефакты, но не основной backlog
команды и не project outputs.

`ai-context` состоит из двух частей:

- `baseline/` - replaceable source-of-truth пакет, который синхронизируется из
  git и может целиком перезаписываться;
- локальные AI-данные прямо в `ai-context/` - `tasks/`, `rules/`, `changelog/`,
  `content/` и `parameters/`, которые имеют project-local приоритет и не должны
  затираться sync-скриптами.

Каталога `workspace/` больше нет. Если в проекте осталась старая схема
`ai-context/workspace/*`, `sync-ai-context.py` должен мигрировать ее в плоскую
структуру. Для `project-manager` backlog отдельное правило: старые
`ai-context/workspace/epics/*` и ошибочно созданные `ai-context/epics/*`
должны переезжать в корневой `epics/`, если целевые пути еще не заняты.

## Состав

- `baseline/ai-rules/` - постоянные межпроектные правила поведения AI-агента.
- `baseline/guides/` - baseline-документы о workflow, task-flow, changelog,
  rules, parameters и `project-manager` режиме.
- `baseline/templates/` - шаблоны для task details, repository parameters и
  bootstrap-файлы локального слоя.
- `baseline/promts/` - переиспользуемые prompt-like команды.
- `baseline/scripts/` - deterministic sync/verify и обязательные служебные
  утилиты.
- `baseline/examples/` - примеры контуров `rules` и `epics`, которые нельзя
  считать живыми рабочими данными проекта.
- `tasks/` - живая очередь задач AI и их детализация.
- `rules/` - project-specific архитектурные и предметные правила.
- `changelog/` - append-only журнал фактических изменений.
- `content/` - supporting-снимки, выдержки и вспомогательные материалы для AI,
  а не канонические `docs/` или `ТЗ`.
- `parameters/` - repository-level и local-machine-level параметры проекта.

Каталог `epics/` намеренно не входит в `ai-context`. В режиме
`project-manager` backlog команды и детализация эпиков должны жить в корне
репозитория в `epics/`.

Имя директории `promts` сохранено для совместимости с уже существующими
репозиториями.

## Правило владения

- Любой файл внутри `ai-context/baseline/` принадлежит source-of-truth и при
  синхронизации может быть удален, заново создан или перезаписан.
- Любой файл в `ai-context/` вне `baseline/` принадлежит конкретному
  репозиторию. Sync-скрипты могут создать такой файл только если его еще нет,
  но не должны перезаписывать существующее локальное содержимое.
- Project outputs вне `ai-context` тоже принадлежат репозиторию. Для
  `project-manager` это в первую очередь `epics/`.
- Если проекту нужна кастомизация, она делается через `tasks/`, `rules/`,
  `changelog/`, `content/` и `parameters/`, а не через ручные правки в
  `baseline/`. Project outputs вроде `epics/`, `docs/`, `specs/` и кода
  хранятся вне `ai-context`.

## Рабочий цикл

1. Перед реализацией подними применимые файлы из `baseline/ai-rules/`,
   `baseline/guides/` и `rules/`.
2. Для задачи AI работай через `tasks/task-list.md` и
   `tasks/task-details/<код>.md`.
3. Для командного backlog в режиме `project-manager` используй корневой
   `epics/`.
4. После file changes добавь запись в `changelog/`.
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

Если проект работает в режиме `project-manager`, sync должен сохранять живой
backlog команды в корневом `epics/`, а не создавать его внутри `ai-context`.

Подробности по устройству baseline-слоя описаны в
`ai-context/baseline/README.md`.
