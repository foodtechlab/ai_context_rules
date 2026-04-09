# Удален Python cache из baseline

- Время: `2026-04-09 15:42:02 +0300`
- Файлы:
  - `ai-context/.gitignore`
  - `ai-context/baseline/scripts/__pycache__/ai_context_sync_lib.cpython-313.pyc`
- Что сделано: из source-of-truth удален ошибочно закоммиченный Python bytecode-файл из `ai-context/baseline/scripts/__pycache__/`.
- Что сделано: в `ai-context/.gitignore` добавлены правила для `__pycache__/` и `*.py[cod]`, чтобы baseline-скрипты не засоряли git в этом репозитории и в целевых репозиториях после sync.
