# Task-details возвращен к плоской файловой модели

- Время: `2026-03-26 05:08:11`
- Файлы: `ai-context/README.md`, `ai-context/ai-rules/003_task-execution-protocol.md`, `ai-context/tasks/README.md`, `ai-context/tasks/task-list.md`, `ai-context/promts/task-detailing-prompt.md`, `ai-context/promts/install-or-update-ai-context-prompt.md`, `ai-context/promts/update-ai-context-prompt.md`, `ai-context/update-policy.md`, `ai-context/parameters/repository/repository-parameters.yaml`, `ai-context/parameters/repository/_template/repository-parameters.yaml`, `ai-context/tasks/task-details/_template.md`, `ai-context/tasks/task-details/_template/README.md`, `ai-context/tasks/task-details/_template/subtasks/README.md`, `ai-context/tasks/task-details/_template/context/README.md`
- Что сделано: стандарт `ai-context/tasks/task-details` возвращен с каталоговой модели к плоским файлам вида `task-details/<код>.md`.
- Что сделано: правила, prompts, update policy и repository parameters обновлены так, чтобы детализация задачи велась в одном файле без `subtasks/` и `context/`.
- Что сделано: шаблон `task-details` переведен в файл `ai-context/tasks/task-details/_template.md`, а старые шаблонные поддиректории удалены.
