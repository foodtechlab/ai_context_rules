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
   - `ai-context/workspace/**` нельзя перезаписывать, если файл уже существует.
8. Разрешено только bootstrap-ить missing workspace-файлы:
   - `ai-context/workspace/tasks/task-list.md`
   - `ai-context/workspace/tasks/task-draft.txt`
   - `ai-context/workspace/tasks/task-details/.gitkeep`
   - `ai-context/workspace/changelog/.gitkeep`
   - `ai-context/workspace/content/.gitkeep`
   - `ai-context/workspace/parameters/repository-parameters.yaml`
   - `ai-context/workspace/parameters/local-machine/.gitignore`
   - `ai-context/workspace/rules/backend/.gitkeep`
   - `ai-context/workspace/rules/flutter/.gitkeep`
   - `ai-context/workspace/rules/frontend-react-js-ts/.gitkeep`
   - `ai-context/workspace/epics/epic-list.md` только в режиме `project-manager`
9. После синхронизации перечисли:
   - какие baseline-файлы обновлены или удалены;
   - какие workspace-области сохранены без перезаписи;
   - были ли drift, конфликты или места для ручного review.

Не делай:
- ручной selective copy вместо запуска sync/verify scripts;
- перезапись живого backlog, task-details, changelog, project-specific rules и repository parameters;
- коммит или перезапись local-machine секретов;
- использование `baseline/examples/` как живых рабочих данных проекта.
```
