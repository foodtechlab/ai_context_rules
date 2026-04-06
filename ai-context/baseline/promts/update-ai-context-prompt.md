# Промт: Обновить данные `ai-context` из source-of-truth репозитория

## Назначение

Используй этот промт, когда пользователь просит:

- обновить данные `ai-context`;
- подтянуть актуальные правила `ai-context`;
- синхронизировать локальный `ai-context` с
  `https://github.com/foodtechlab/ai_context_rules`.

## Готовый промт

```text
Обнови данные `ai-context` в текущем рабочем репозитории из `https://github.com/foodtechlab/ai_context_rules`.

Обязательные правила:

1. Используй актуальную baseline-версию из основной ветки source-of-truth репозитория:
- `main`, если она существует;
- `master`, если репозиторий использует ее как основную ветку.

2. Сначала прочитай `ai-context/baseline/update-policy.md` в source-of-truth репозитории.

3. Не обновляй `ai-context` вручную по смыслу. Запусти deterministic scripts:
- `python3 ai-context/baseline/scripts/sync-ai-context.py --source-repo https://github.com/foodtechlab/ai_context_rules --target-dir .`
- `python3 ai-context/baseline/scripts/verify-ai-context.py --source-repo https://github.com/foodtechlab/ai_context_rules --target-dir .`
Если репозиторий работает в режиме `project-manager`, передай в оба запуска `--mode project-manager`, если это не считывается автоматически из `workspace/parameters/repository-parameters.yaml`.

4. Обновляй только baseline-owned слой:
- `ai-context/.gitignore`
- `ai-context/README.md`
- `ai-context/baseline/**/*`

5. Не перезаписывай существующие project-local данные в `ai-context/workspace/**/*`.

6. Разрешено только создавать missing workspace bootstrap-файлы, если их еще нет.

7. После обновления:
- перечисли, какие baseline-файлы обновлены или удалены;
- перечисли, какие workspace-области сохранены без перезаписи;
- отдельно укажи, были ли drift, конфликты или места для ручного review.

Не делай:
- ручную selective sync вместо запуска scripts;
- перезапись `ai-context/workspace/tasks/**/*`;
- перезапись `ai-context/workspace/changelog/**/*`;
- перезапись `ai-context/workspace/rules/**/*`;
- перезапись `ai-context/workspace/parameters/**/*`;
- перезапись `ai-context/workspace/epics/**/*`;
- коммит или удаление local-machine секретов.
```
