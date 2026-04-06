# Разделение `ai-context` на `baseline` и `workspace`

- Время: `2026-04-06 05:47:06 +0300`
- Файлы:
  - `README.md`
  - `ai-context/README.md`
  - `ai-context/.gitignore`
  - `ai-context/baseline/**/*`
  - `ai-context/workspace/parameters/repository-parameters.yaml`
  - `ai-context/workspace/tasks/task-list.md`
  - `ai-context/workspace/tasks/task-draft.txt`
  - `ai-context/workspace/parameters/local-machine/.gitignore`
  - `ai-context/workspace/rules/**/*`
  - `ai-context/workspace/tasks/task-details/.gitkeep`
- Что сделано: `ai-context` физически разделен на source-of-truth слой `baseline/` и локальный слой `workspace/`, чтобы baseline можно было детерминированно перезаписывать, а живые данные проекта больше не смешивались с шаблонными файлами.
- Что сделано: добавлены `ai-context/baseline/manifest.json`, `sync-ai-context.py` и `verify-ai-context.py`, которые синхронизируют baseline как exact-copy слой и только bootstrap-ят отсутствующие workspace-файлы.
- Что сделано: guides, ai-rules, prompts, templates и repository parameters переписаны под новую схему путей `baseline/workspace`, а пример `epics/` перенесен в `baseline/examples/epics/`.
