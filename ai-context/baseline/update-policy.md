# Политика установки и обновления `ai-context`

Этот документ задает обязательную модель синхронизации для `ai-context` после
разделения на `baseline` и `workspace`.

## Source-of-truth

Текущий source-of-truth репозиторий:

- `https://github.com/foodtechlab/ai_context_rules`

При синхронизации baseline нужно брать из основной ветки:

- `main`, если она существует;
- `master`, если основной веткой остается она.

## 1. Главный инвариант

`ai-context` делится на два физических слоя:

- `ai-context/baseline/` - полностью принадлежит source-of-truth;
- `ai-context/workspace/` - полностью принадлежит конкретному рабочему
  репозиторию.

Следствие:

- `baseline` можно детерминированно заменять и удалять по состоянию
  source-of-truth;
- `workspace` нельзя перезаписывать при update, если файл уже существует;
- любые project-specific правила, backlog, changelog, repository parameters и
  секреты должны жить только в `workspace`.

## 2. Что обновляется всегда

Baseline-sync должен всегда приводить к точному совпадению с source-of-truth
для baseline-owned файлов:

- `ai-context/.gitignore`
- `ai-context/README.md`
- `ai-context/baseline/**/*`

Это включает:

- `baseline/ai-rules/**/*`
- `baseline/guides/**/*`
- `baseline/templates/**/*`
- `baseline/promts/**/*`
- `baseline/scripts/**/*`
- `baseline/examples/**/*`
- `baseline/update-policy.md`
- `baseline/manifest.json`

Если baseline-файл исчез из source-of-truth, он должен быть удален и в целевом
репозитории.

## 3. Что не перезаписывается

Workspace-слой всегда имеет локальный приоритет:

- `ai-context/workspace/content/**/*`
- `ai-context/workspace/tasks/**/*`
- `ai-context/workspace/changelog/**/*`
- `ai-context/workspace/rules/**/*`
- `ai-context/workspace/parameters/repository-parameters.yaml`
- `ai-context/workspace/parameters/local-machine/**/*`
- `ai-context/workspace/epics/**/*`

Исключение только одно: при первой установке baseline-sync может создать
bootstrap-файлы в `workspace`, если их еще нет.

## 4. Правило первой установки

Если `ai-context` в проекте отсутствует:

1. скопируй baseline-owned файлы из source-of-truth;
2. создай недостающие workspace-директории;
3. создай bootstrap-файлы только если они отсутствуют:
   - `workspace/tasks/task-list.md`
   - `workspace/tasks/task-draft.txt`
   - `workspace/tasks/task-details/.gitkeep`
   - `workspace/changelog/.gitkeep`
   - `workspace/content/.gitkeep`
   - `workspace/parameters/repository-parameters.yaml`
   - `workspace/parameters/local-machine/.gitignore`
   - `workspace/rules/backend/.gitkeep`
   - `workspace/rules/flutter/.gitkeep`
   - `workspace/rules/frontend-react-js-ts/.gitkeep`
4. если выбран режим `project-manager`, дополнительно создай:
   - `workspace/epics/epic-list.md`
5. не придумывай project-specific содержимое для `workspace/rules`,
   `workspace/tasks`, `workspace/changelog` и `workspace/epics`.

## 5. Правило обновления

Если `ai-context` уже установлен:

1. обнови baseline exactly-as-source;
2. не трогай существующие файлы в `workspace`;
3. при необходимости создай только недостающие bootstrap-файлы в `workspace`;
4. после обновления обязательно запусти verify-скрипт;
5. в отчете перечисли:
   - откуда взят baseline;
   - какие baseline-файлы обновлены или удалены;
   - какие workspace-области сохранены без перезаписи;
   - были ли drift, конфликты или места для ручного review.

## 6. Что запрещено

- Редактировать `ai-context/baseline/**` локально как project-specific слой.
- Перезаписывать `workspace/tasks/task-list.md` и `workspace/tasks/task-details/*`
  шаблонными версиями поверх живого backlog.
- Перезаписывать `workspace/parameters/repository-parameters.yaml`
  baseline-шаблоном поверх настроек конкретного репозитория.
- Перезаписывать `workspace/changelog/**/*`.
- Перезаписывать `workspace/rules/**/*`.
- Перезаписывать `workspace/epics/**/*` в режиме `project-manager`.
- Коммитить реальные local-machine секреты из
  `workspace/parameters/local-machine/`.
- Подменять project-specific workspace-файлы baseline examples или заглушками.

## 7. Обязательный порядок действий агента

При установке или обновлении агент должен:

1. прочитать этот файл;
2. запустить `ai-context/baseline/scripts/sync-ai-context.py`;
3. запустить `ai-context/baseline/scripts/verify-ai-context.py`;
4. коротко сообщить результат по стандарту из пункта 5.
