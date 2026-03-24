# Запрет `README.md` для рабочих данных внутри эпиков

- Время: `2026-03-24 17:52:47`
- Файлы: `ai-context/README.md`, `ai-context/ai-rules/009_project-manager-epics-root.md`, `ai-context/parameters/repository/repository-parameters.yaml`, `ai-context/parameters/repository/_template/repository-parameters.yaml`, `epics/README.md`, `epics/_example/EP-001/EP-001-epic.md`, `epics/_example/EP-002/EP-002-epic.md`
- Что сделано: из структуры `epics/<код>/` убран `README.md` как носитель рабочих данных, чтобы `README` оставался только документационным файлом.
- Что сделано: основная постановка эпика переведена на формат `<код>-epic.md`, а декомпозиция остается в файле `<код>.md`.
