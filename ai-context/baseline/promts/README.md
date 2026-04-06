# Promts

Эта директория хранит baseline-промты для типовых операций вокруг
`ai-context`.

Имя директории сохранено как `promts` для совместимости с уже существующими
репозиториями.

## Набор промтов

Подробные инструкции лежат в отдельных `.md`-файлах. Здесь только быстрый
справочник: что написать в чат, чтобы нужный prompt сработал.

| Файл | Что написать в чат | Что делает |
| --- | --- | --- |
| `install-or-update-ai-context-prompt.md` | `установи ai-context из https://github.com/foodtechlab/ai_context_rules` | Устанавливает `baseline` и bootstrap-ит missing `workspace` |
| `install-or-update-ai-context-prompt.md` | `обнови ai-context из https://github.com/foodtechlab/ai_context_rules` | Обновляет `baseline` через sync/verify scripts |
| `update-ai-context-prompt.md` | `обнови данные ai-context из https://github.com/foodtechlab/ai_context_rules` | Обновляет только baseline-owned слой без перезаписи `workspace` |
| `task-list-formatting-prompt.md` | `отформатируй задачи` | Приводит `workspace/tasks/task-list.md` к рабочему формату |
| `task-detailing-prompt.md` | `детализируй <код>` | Создает task detail в `workspace/tasks/task-details/` |
