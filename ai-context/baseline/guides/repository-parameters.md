# Repository Parameters Guide

Repository-level параметры текущего проекта всегда живут в
`ai-context/parameters/repository-parameters.yaml`.

Baseline-шаблон для первой установки лежит в
`ai-context/baseline/templates/repository-parameters.yaml`.

## Что сюда можно класть

- режим использования `ai-context` в проекте;
- правила выбора кодов задач;
- рабочие пути внутри AI-контура `ai-context/`;
- режимы работы с backlog, rules и task-details;
- путь до repo-local каталога `mcp/`, если он фиксируется в параметрах;
- путь до project outputs вне `ai-context`, например до командного backlog
  `epics/` для режима `project-manager`;
- любые несекретные параметры, которые должны быть общими для репозитория.
