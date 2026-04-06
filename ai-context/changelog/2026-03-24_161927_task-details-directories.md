# Task-details переведен на каталоговую модель

- Время: `2026-03-24 16:19:27`
- Файлы: `ai-context/tasks/README.md`, `ai-context/ai-rules/003_task-execution-protocol.md`, `ai-context/update-policy.md`, `ai-context/promts/install-or-update-ai-context-prompt.md`, `ai-context/promts/task-detailing-prompt.md`, `ai-context/tasks/task-details/_template/README.md`, `ai-context/tasks/task-details/_template/subtasks/README.md`, `ai-context/tasks/task-details/_template/context/README.md`
- Что сделано: стандарт `task-details` переведен с плоских файлов на директории вида `task-details/<код>/`, внутри которых основной `README.md` дополняется каталогами `subtasks/` и `context/`.
- Что сделано: rules, prompts и update policy обновлены под новую модель, чтобы эпики, подзадачи и дополнительные материалы можно было хранить в одной структуре задачи.
