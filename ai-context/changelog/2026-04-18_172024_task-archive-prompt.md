# В baseline добавлена команда архивации задач

- Время: `2026-04-18 17:20:24 +0300`
- Файлы:
  - `README.md`
  - `ai-context/README.md`
  - `ai-context/baseline/guides/tasks.md`
  - `ai-context/baseline/manifest.json`
  - `ai-context/baseline/promts/README.md`
  - `ai-context/baseline/promts/task-archive-prompt.md`
  - `ai-context/baseline/templates/repository-parameters.yaml`
  - `ai-context/baseline/templates/tasks/task-archive/archive.md`
  - `ai-context/baseline/templates/tasks/task-list.md`
  - `ai-context/parameters/repository-parameters.yaml`
  - `ai-context/tasks/task-archive/archive.md`
  - `ai-context/tasks/task-list.md`
- Промт пользователя:
  ```text
  давай в baseline создадим правило для работы с tasks и tasks-list

  я хочу, что бы когда вызывалась команда-промт "архивируй задачи, то просиходило следующее:

  все задачи в статусе готово(зеленый эмодзи) из task-details переносились в task-archive директорию, а все строчки из task-list.md переносились в файл task-archive/archive.md
  ```
- Что сделано: в baseline task-guide добавлена команда `архивируй задачи` с правилом архивации только задач со статусом `🟢`.
- Что сделано: в `baseline/promts/` добавлен отдельный prompt `task-archive-prompt.md`, а справочник prompt-команд обновлен.
- Что сделано: bootstrap-структура `tasks/` расширена каталогом `task-archive/`, файлом `archive.md`, новыми путями в manifest и параметрах репозитория.
