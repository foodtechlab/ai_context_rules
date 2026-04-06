# Промт: Установить или обновить `ai-context` из source-of-truth репозитория

## Назначение

Используй этот промт, когда пользователь просит:

- установить `ai-context` в новый рабочий репозиторий;
- обновить `ai-context` из репозитория
  `https://github.com/foodtechlab/ai_context_rules`;
- синхронизировать baseline-правила без потери локального рабочего состояния.

## Готовый промт

```text
Установи или обнови `ai-context` в текущем рабочем репозитории из `https://github.com/foodtechlab/ai_context_rules`.

Обязательные правила:

1. Сначала используй актуальную baseline-версию из основной ветки source-of-truth репозитория:
- `main`, если она существует;
- `master`, если репозиторий использует ее как основную ветку.
2. Сначала прочитай `ai-context/baseline/update-policy.md` в source-of-truth репозитории.
3. Не синхронизируй `ai-context` вручную по смыслу. Используй deterministic scripts.
4. Если `ai-context` уже есть в проекте, запусти:
   - `python3 ai-context/baseline/scripts/sync-ai-context.py --source-repo https://github.com/foodtechlab/ai_context_rules --target-dir .`
   - `python3 ai-context/baseline/scripts/verify-ai-context.py --source-repo https://github.com/foodtechlab/ai_context_rules --target-dir .`
5. Если `ai-context` в проекте еще нет, временно клонируй source-of-truth и запусти из него `sync-ai-context.py` против текущего репозитория, затем `verify-ai-context.py`.
6. Если пользователь явно выбрал режим `project-manager`, передай в оба запуска `--mode project-manager`.
7. Разделение ownership жесткое:
   - `ai-context/baseline/**` и baseline-owned root файлы можно перезаписывать;
   - локальный слой `ai-context/**` вне `baseline/` нельзя перезаписывать, если файл уже существует.
8. Если в репозитории еще есть legacy-layout `ai-context/workspace/*`, sync может мигрировать его в плоские пути `ai-context/*`, но только если целевой путь еще не существует.
9. Разрешено только bootstrap-ить missing local-файлы:
   - `ai-context/tasks/task-list.md`
   - `ai-context/tasks/task-draft.txt`
   - `ai-context/tasks/task-details/.gitkeep`
   - `ai-context/changelog/.gitkeep`
   - `ai-context/content/.gitkeep`
   - `ai-context/parameters/repository-parameters.yaml`
   - `ai-context/parameters/local-machine/.gitignore`
   - `ai-context/rules/backend/.gitkeep`
   - `ai-context/rules/flutter/.gitkeep`
   - `ai-context/rules/frontend-react-js-ts/.gitkeep`
   - `ai-context/epics/epic-list.md` только в режиме `project-manager`
10. После синхронизации перечисли:
   - какие baseline-файлы обновлены или удалены;
   - какие legacy-пути были мигрированы;
   - какие локальные области сохранены без перезаписи;
   - были ли drift, конфликты или места для ручного review.

Не делай:
- ручной selective copy вместо запуска sync/verify scripts;
- перезапись живого backlog, task-details, changelog, project-specific rules и repository parameters;
- коммит или перезапись local-machine секретов;
- использование `baseline/examples/` как живых рабочих данных проекта.
```
