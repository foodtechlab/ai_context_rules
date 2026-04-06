# Parameters Guide

Параметры использования `ai-context` разделяются на два scope и физически живут
в `workspace/`.

## Где лежат реальные параметры

- `ai-context/workspace/parameters/repository-parameters.yaml` -
  repository-level параметры текущего репозитория;
- `ai-context/workspace/parameters/local-machine/` - local-machine параметры
  текущей машины.

## Где лежат baseline-шаблоны

- `ai-context/baseline/templates/repository-parameters.yaml`
- `ai-context/baseline/templates/local-machine.example.yaml`
- `ai-context/baseline/templates/workspace/parameters/local-machine/.gitignore`

## Базовый принцип

- Repository-level параметры можно коммитить.
- Local-machine-level параметры коммитить нельзя.
- Реальные локальные секреты создаются пользователем только в `workspace/`.
- Baseline хранит только структуру, шаблоны и документацию, но не реальные
  значения параметров проекта.
