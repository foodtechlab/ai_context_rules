# Политика установки и обновления `ai-context`

Этот документ нужен для сценария:

- в рабочем репозитории пользователю дают ссылку на
  `https://github.com/foodtechlab/ai_context_rules`;
- AI-агент должен установить или обновить `ai-context`;
- при обновлении нельзя затереть живые рабочие данные проекта.

## Source-of-truth

Текущий source-of-truth репозиторий для правил:

- `https://github.com/foodtechlab/ai_context_rules`

Актуальную baseline-версию нужно брать из основной ветки:

- `main`, если она существует;
- `master`, если в репозитории основной веткой остается она.

## 1. Базовое правило

`ai-context` делится на две части:

- baseline - общие правила, шаблоны и служебные скрипты, которые можно
  переносить между репозиториями;
- project-local - фактический рабочий контекст конкретного проекта, который
  нужно сохранять.

При обновлении агент обязан различать эти две группы.

Если репозиторий работает в режиме `project-manager`, корневая директория
`epics/` делится на две части:

- документационный baseline из source-of-truth;
- project-local backlog команды, который нельзя затирать.

## 2. Что считать baseline

Эти файлы и директории можно копировать или обновлять из source-of-truth
репозитория и его основной ветки (`main` или `master`):

- `ai-context/README.md`
- `ai-context/update-policy.md`
- `ai-context/.gitignore`
- `ai-context/ai-rules/**/*`
- `ai-context/parameters/README.md`
- `ai-context/parameters/repository/README.md`
- `ai-context/parameters/repository/_template/**/*`
- `ai-context/parameters/local-machine/README.md`
- `ai-context/parameters/local-machine/.gitignore`
- `ai-context/parameters/local-machine/local-machine.example.yaml`
- `ai-context/scripts/**/*`
- `ai-context/promts/**/*`
- `ai-context/tasks/README.md`
- `ai-context/tasks/task-details/_template/**/*`
- `ai-context/changelog/README.md`
- `ai-context/rules/README.md`
- `ai-context/rules/_template.md`

Если в целевом проекте выбран режим `project-manager`, дополнительно можно
копировать только документационную baseline-часть корневой директории
`epics/`:

- `epics/README.md`
- `epics/_example/**/*`

Если в целевом проекте baseline-файл уже изменялся вручную под локальные нужды,
агент не должен слепо перезаписывать его. Нужно сделать merge по смыслу и
сохранить локальные адаптации, если они осознанные.

## 3. Что считать project-local

Эти файлы и директории отражают живое состояние конкретного проекта и обычно не
должны перезаписываться из шаблона:

- `ai-context/content/**/*`
- `ai-context/parameters/repository/repository-parameters.yaml`
- `ai-context/parameters/local-machine/**/*`, кроме `README.md`, `.gitignore` и `local-machine.example.yaml`
- `ai-context/tasks/task-list.md`
- `ai-context/tasks/task-draft.txt`
- `ai-context/tasks/task-details/**/*`, кроме `ai-context/tasks/task-details/_template/**/*`
- `ai-context/changelog/*.md`, кроме `README.md`
- `ai-context/rules/*.md`, кроме `README.md` и `_template.md`
- `epics/**/*`, кроме `epics/README.md` и `epics/_example/**/*`
- любые project-specific API-материалы, интеграционные дампы и вспомогательные
  скрипты, если они были добавлены поверх baseline

## 4. Правило первой установки

Если `ai-context` в проекте еще нет:

1. скопируй весь baseline;
2. создай пустые project-local файлы и директории, если их нет:
   - `content/.gitkeep`
   - `parameters/repository/repository-parameters.yaml`
   - `tasks/task-list.md`
   - `tasks/task-draft.txt`
3. если в `repository-parameters.yaml` выбран режим `project-manager`, скопируй
   из source-of-truth только документационную часть `epics/`:
   - `epics/README.md`
   - `epics/_example/**/*`
4. если в `repository-parameters.yaml` выбран режим `project-manager`, создай
   корневую директорию `epics/` и минимальный project-local каркас:
   - `epics/epic-list.md`
5. если режим `project-manager` не выбран, не копируй `epics/` из
   source-of-truth в рабочий проект.
6. не добавляй вымышленные project-specific правила в `rules/` без анализа
   реального кода и архитектуры проекта.

## 5. Правило обновления

Если `ai-context` в проекте уже есть:

1. обнови baseline-файлы;
2. не затирай project-local артефакты;
3. если в проекте выбран режим `project-manager`, внутри `epics/` обновляй
   только документационные baseline-файлы `README.md` и `_example/**/*`;
4. не удаляй существующие `task-details`, `changelog` и project-specific
   `rules`, а в режиме `project-manager` также не удаляй и не переписывай
   `epics/epic-list.md` и рабочие директории эпиков;
5. если структура baseline изменилась, добавь недостающие каталоги и шаблоны,
   но не очищай локальное содержимое;
6. в отчете явно перечисли:
   - какие baseline-файлы обновлены;
   - какие project-local файлы сохранены без перезаписи;
   - где потребовался merge вместо слепой замены.

## 6. Что запрещено

- Перезаписывать `task-list.md` шаблонной версией поверх живого backlog.
- Перезаписывать `parameters/repository/repository-parameters.yaml` шаблонной
  версией поверх настроек конкретного репозитория.
- Копировать `epics/` из source-of-truth в проект не в режиме
  `project-manager`.
- Перезаписывать в режиме `project-manager` рабочие данные внутри `epics/`
  поверх живого backlog команды.
- Считать `_example/` из `epics/` рабочими эпиками проекта.
- Коммитить реальные local-machine параметры и секреты из
  `ai-context/parameters/local-machine/`.
- Удалять `content/` при обновлении правил.
- Затирать существующие changelog-файлы.
- Массово переписывать project-specific `rules/`, если они уже описывают
  архитектуру конкретного проекта.
- Подменять локальные скрипты интеграций или API-материалы шаблонными
  заглушками без прямого запроса пользователя.

## 7. Минимальный протокол ответа агента при синхронизации

После установки или обновления агент должен коротко сообщить:

- источник baseline;
- список обновленных baseline-файлов;
- список сохраненных project-local областей;
- были ли конфликты или места, где нужен ручной review.
