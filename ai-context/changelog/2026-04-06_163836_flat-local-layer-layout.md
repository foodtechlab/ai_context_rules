# Плоский локальный слой `ai-context`

- Время: `2026-04-06 16:38:36 +0300`
- Файлы:
  - `ai-context/README.md`
  - `ai-context/.gitignore`
  - `ai-context/baseline/**/*`
  - `ai-context/changelog/**/*`
  - `ai-context/content/.gitkeep`
  - `ai-context/parameters/**/*`
  - `ai-context/rules/**/*`
  - `ai-context/tasks/**/*`
- Что сделано: локальный слой вынесен из `ai-context/workspace/` на уровень `ai-context/`, чтобы `baseline/` оставался replaceable source-of-truth пакетом, а рабочие данные репозитория жили рядом с ним.
- Что сделано: `manifest.json`, `sync-ai-context.py`, `verify-ai-context.py` и `ai_context_sync_lib.py` обновлены под плоские пути и автоматическую миграцию legacy-layout `ai-context/workspace/*`.
- Что сделано: шаблоны, repository parameters, guides, ai-rules, prompts и examples переписаны под новую структуру `tasks/`, `rules/`, `changelog/`, `content/`, `parameters/` и `epics/`.
