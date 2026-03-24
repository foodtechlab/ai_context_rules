# Уточнение поставки `epics/` из source-of-truth

- Время: `2026-03-24 17:42:47`
- Файлы: `README.md`, `ai-context/README.md`, `ai-context/ai-rules/009_project-manager-epics-root.md`, `ai-context/parameters/repository/repository-parameters.yaml`, `ai-context/parameters/repository/_template/repository-parameters.yaml`, `ai-context/update-policy.md`, `ai-context/promts/install-or-update-ai-context-prompt.md`, `ai-context/promts/update-ai-context-prompt.md`, `epics/README.md`
- Что сделано: уточнено, что корневая директория `epics/` в этом source-of-truth репозитории является документационным шаблоном, а не живым backlog.
- Что сделано: зафиксировано, что `epics/` копируется в целевой проект только в режиме `project-manager` и только как документация.
- Что сделано: update policy, prompts и repository parameters обновлены так, чтобы рабочие данные внутри `epics/` оставались project-local и не перезаписывались при синхронизации.
