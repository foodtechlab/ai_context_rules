# Parameters Guide

Параметры использования `ai-context` разделяются на два scope и физически живут
в локальном слое `ai-context/`.

## Где лежат реальные параметры

- `ai-context/parameters/repository-parameters.yaml` -
  repository-level параметры текущего репозитория;
- `ai-context/parameters/local-machine/` - local-machine параметры
  текущей машины.

## Где лежат baseline-шаблоны

- `ai-context/baseline/templates/repository-parameters.yaml`
- `ai-context/baseline/templates/local-machine.example.yaml`
- `ai-context/baseline/templates/parameters/local-machine/.gitignore`

## Базовый принцип

- Repository-level параметры можно коммитить.
- Local-machine-level параметры коммитить нельзя.
- Реальные локальные секреты создаются пользователем только в `parameters/`.
- Baseline хранит только структуру, шаблоны и документацию, но не реальные
  значения параметров проекта.
- Repository-level параметры могут описывать и AI-контур внутри `ai-context`,
  включая repo-local `mcp/`, и project outputs вне него, например корневой
  `epics/`.
