# Постоянные правила для AI-агента

Эта директория хранит межпроектные правила, которые входят в baseline-слой и
синхронизируются между репозиториями как source-of-truth.

## Назначение

- фиксировать постоянное поведение AI-агента;
- задавать единый baseline для инженерной работы;
- уменьшать неоднозначность при переносе `ai-context` в новый проект.

## Граница ответственности

- `baseline/ai-rules/` - стабильные общие правила работы агента;
- `rules/` - project-specific архитектурные и предметные правила;
- `mcp/` - project-specific контекст по MCP и repo-local инструкции по
  интеграциям;
- `baseline/guides/tasks.md` - workflow и execution-слой для задач, статусов,
  алерта, changelog и резюме для коммита.

## Текущий набор правил

- `001_russian-language.md` - документация и данные по умолчанию ведутся на
  русском языке.
- `002_context-before-analysis.md` - перед реализацией должен быть собран и
  зафиксирован достаточный проектный контекст.
- `003_task-execution-protocol.md` - задачи AI ведутся через
  `ai-context/tasks`.
- `004_completion-alert-and-commit-summary.md` - завершение работы включает
  модальный алерт и готовое резюме для коммита.
- `005_append-only-changelog.md` - любые file changes фиксируются в
  `ai-context/changelog`.
- `006_project-architecture-rules.md` - долгоживущие архитектурные решения
  живут в `ai-context/rules`.
- `007_ai-manifest-it-contour-v1.md` - первая версия AI-манифеста для
  IT-контура компании, перенесенная из `ceo-ai`.
- `008_ai-context-parameters-scope.md` - параметры `ai-context` разделяются на
  repository-level и local-machine-level с разными правилами хранения.
- `009_project-manager-epics-root.md` - в режиме `project-manager` командные
  эпики и задачи живут в корневом `epics/`, а не внутри `ai-context`.
- `010_mcp-locality-and-scope.md` - общие правила по MCP живут в baseline, а
  repo-specific MCP-контекст хранится в `ai-context/mcp`.
