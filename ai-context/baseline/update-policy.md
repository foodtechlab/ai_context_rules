# Политика установки и обновления `ai-context`

Этот документ задает обязательную модель синхронизации после разделения
`ai-context` как контура работы AI и project outputs репозитория.

## Source-of-truth

Текущий source-of-truth репозиторий:

- `https://github.com/foodtechlab/ai_context_rules`

При синхронизации baseline нужно брать из основной ветки:

- `main`, если она существует;
- `master`, если основной веткой остается она.

## 1. Главный инвариант

Нужно разделять три зоны владения:

- `ai-context/baseline/` - полностью принадлежит source-of-truth;
- `ai-context/` вне `baseline/` - локальный операционный контур AI;
- `epics/` в корне репозитория - backlog команды и project output для режима
  `project-manager`.

Локальный AI-контур включает:

- `ai-context/tasks/**/*`
- `ai-context/rules/**/*`
- `ai-context/changelog/**/*`
- `ai-context/content/**/*`
- `ai-context/mcp/**/*`
- `ai-context/parameters/**/*`

Следствие:

- `baseline` можно детерминированно заменять и удалять по состоянию
  source-of-truth;
- локальный AI-контур нельзя перезаписывать при update, если файл уже
  существует;
- `epics/**/*` нельзя перезаписывать при update;
- любые project-specific правила, MCP-контекст, backlog, changelog,
  repository parameters и секреты должны жить только в repo-owned зонах, а не
  в replaceable baseline.

## 2. Legacy layout

Старая схема `ai-context/workspace/*` считается legacy-layout.

При sync допускаются только безопасные автоматические миграции:

- если legacy-путь существует;
- и новый путь еще не существует;
- sync-скрипт переносит содержимое:
  - из `ai-context/workspace/content`, `changelog`, `tasks`, `rules`,
    `parameters` в соответствующие пути внутри `ai-context/*`;
  - из `ai-context/workspace/epics` в корневой `epics/`;
  - из ошибочно созданного `ai-context/epics` в корневой `epics/`.

Если и legacy-путь, и новый путь уже существуют одновременно, sync не должен
ничего перезаписывать и обязан оставить это место для ручного review.

## 3. Что обновляется всегда

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

## 4. Что не перезаписывается

Локальный AI-контур всегда имеет project-local приоритет:

- `ai-context/content/**/*`
- `ai-context/tasks/**/*`
- `ai-context/changelog/**/*`
- `ai-context/rules/**/*`
- `ai-context/mcp/**/*`
- `ai-context/parameters/repository-parameters.yaml`
- `ai-context/parameters/local-machine/**/*`
- `epics/**/*`

Исключение только одно: при первой установке baseline-sync может создать
bootstrap-файлы в repo-owned зонах, если их еще нет.

## 5. Правило первой установки

Если `ai-context` в проекте отсутствует:

1. скопируй baseline-owned файлы из source-of-truth;
2. создай недостающие локальные директории;
3. создай bootstrap-файлы только если они отсутствуют:
   - `tasks/task-list.md`
   - `tasks/task-draft.txt`
   - `tasks/task-details/.gitkeep`
   - `changelog/.gitkeep`
   - `content/.gitkeep`
   - `mcp/README.md`
   - `parameters/repository-parameters.yaml`
   - `parameters/local-machine/.gitignore`
   - `rules/backend/.gitkeep`
   - `rules/flutter/.gitkeep`
   - `rules/frontend-react-js-ts/.gitkeep`
4. если выбран режим `project-manager`, дополнительно создай:
   - `epics/epic-list.md`
5. не придумывай project-specific содержимое для `rules`, `mcp/`, `tasks`,
   `changelog` и `epics`.

## 6. Правило обновления

Если `ai-context` уже установлен:

1. обнови baseline exactly-as-source;
2. при необходимости мигрируй legacy-layout `ai-context/workspace/*` и старый
   `ai-context/epics/*` в актуальные пути;
3. не трогай существующие файлы локального AI-контура и project outputs;
4. при необходимости создай только недостающие bootstrap-файлы;
5. после обновления обязательно запусти verify-скрипт;
6. в отчете перечисли:
   - откуда взят baseline;
   - какие baseline-файлы обновлены или удалены;
   - какие legacy-пути были мигрированы;
   - какие локальные области сохранены без перезаписи;
   - были ли drift, конфликты или места для ручного review.

## 7. Что запрещено

- Редактировать `ai-context/baseline/**` локально как project-specific слой.
- Перезаписывать `tasks/task-list.md` и `tasks/task-details/*` шаблонными
  версиями поверх живого backlog.
- Перезаписывать `parameters/repository-parameters.yaml` baseline-шаблоном
  поверх настроек конкретного репозитория.
- Перезаписывать `changelog/**/*`.
- Перезаписывать `rules/**/*`.
- Перезаписывать `mcp/**/*`.
- Перезаписывать `epics/**/*` в режиме `project-manager`.
- Считать `epics/` частью `ai-context` или replaceable AI-слоем.
- Коммитить реальные local-machine секреты из `parameters/local-machine/`.
- Подменять project-specific локальные файлы baseline examples или заглушками.

## 8. Обязательный порядок действий агента

При установке или обновлении агент должен:

1. прочитать этот файл;
2. запустить `ai-context/baseline/scripts/sync-ai-context.py`;
3. запустить `ai-context/baseline/scripts/verify-ai-context.py`;
4. коротко сообщить результат по стандарту из пункта 6.
