# Скрипты `ai-context`

Эта директория хранит baseline-скрипты, которые синхронизируются из
source-of-truth и могут перезаписываться при update.

## Базовый набор

- `sync-ai-context.py` - детерминированно синхронизирует baseline и создает
  missing bootstrap-файлы в `workspace/`.
- `verify-ai-context.py` - проверяет структуру и drift после синхронизации.
- `show-completion-alert.sh` - обязательный единый способ показать модальный
  алерт о завершении задачи на macOS.

## Принцип

- Если какой-то скрипт становится частью обязательного процесса, это должно
  быть явно отражено в `baseline/ai-rules` или `baseline/guides`.
- Project-specific утилиты не должны подменять baseline-скрипты.
