# Добавлены правила кода задачи с поддержкой Jira и Bitrix

- Время: `2026-03-24 16:14:47`
- Файлы: `ai-context/tasks/README.md`, `ai-context/tasks/task-list.md`, `ai-context/tasks/task-details/_template.md`, `ai-context/promts/task-list-formatting-prompt.md`, `ai-context/promts/task-detailing-prompt.md`, `ai-context/promts/README.md`
- Что сделано: в `tasks/README.md` добавлены требования к коду задачи: локальный формат `01-001` сохранен как default, но теперь явно разрешены Jira key и Bitrix task id, если это предписано локальными стандартами репозитория.
- Что сделано: examples и prompt-ы обновлены с жесткого `01-001` на более общий `<код>`, чтобы task flow поддерживал и локальные коды, и внешние идентификаторы трекеров.
