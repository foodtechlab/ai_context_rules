# Promts

Эта директория хранит переиспользуемые промты для типовых операций вокруг
`ai-context`.

Имя директории сохранено как `promts` для совместимости с уже существующими
репозиториями.

## Набор промтов

Подробные инструкции лежат в отдельных `.md`-файлах. Здесь только быстрый
справочник: что написать в чат, чтобы нужный prompt сработал.

| Файл | Что написать в чат | Что делает |
| --- | --- | --- |
| `install-or-update-ai-context-prompt.md` | `установи ai-context из https://github.com/foodtechlab/ai_context_rules` | Устанавливает `ai-context` из source-of-truth репозитория |
| `install-or-update-ai-context-prompt.md` | `обнови ai-context из https://github.com/foodtechlab/ai_context_rules` | Обновляет `ai-context` из source-of-truth репозитория |
| `update-ai-context-prompt.md` | `обнови данные ai-context из https://github.com/foodtechlab/ai_context_rules` | Обновляет baseline-данные `ai-context` без перезаписи project-local файлов |
| `task-list-formatting-prompt.md` | `отформатируй задачи` | Приводит `task-list.md` к рабочему формату |
| `task-detailing-prompt.md` | `детализируй <код>` | Создает подробный task detail для задачи по коду |
