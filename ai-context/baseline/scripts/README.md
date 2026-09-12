# Скрипты `ai-context`

Эта директория хранит baseline-скрипты, которые синхронизируются из
source-of-truth и могут перезаписываться при update.

## Базовый набор

- `sync-ai-context.py` - детерминированно синхронизирует baseline и создает
  missing bootstrap-файлы в repo-owned зонах, а также мигрирует legacy-layout
  `ai-context/workspace/*`. Для `epics` целевой путь - корневой `epics/`, а
  не `ai-context/epics/`.
- `verify-ai-context.py` - проверяет структуру и drift после синхронизации.
- `install-ai-context-skills.py` - берет свежий skills manifest из
  source-of-truth и устанавливает или обновляет управляемые `aic-*` skills в
  `.agents/skills` текущего репозитория.
- `verify-ai-context-skills.py` - проверяет установленный repository-набор на
  полноту и drift относительно source-of-truth.
- `ai_context_skills_lib.py` - общая валидация skills manifest и metadata.
- `show-completion-alert.sh` - обязательный единый способ показать модальный
  алерт о завершении задачи на macOS.

## Принцип

- Если какой-то скрипт становится частью обязательного процесса, это должно
  быть явно отражено в `baseline/ai-rules` или `baseline/guides`.
- Project-specific утилиты не должны подменять baseline-скрипты.
- Skills scripts устанавливают skills в `.agents/skills/` текущего
  репозитория.
