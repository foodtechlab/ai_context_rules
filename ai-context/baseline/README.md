# Baseline Layer

`ai-context/baseline/` - это source-of-truth слой, который переносится между
репозиториями и может полностью перезаписываться при синхронизации.

## Что сюда входит

- `ai-rules/` - постоянные правила поведения AI-агента;
- `guides/` - baseline-документы о workflow и структурах `workspace/`;
- `templates/` - шаблоны для новых репозиториев и bootstrap-файлы локального
  workspace;
- `promts/` - prompt-like команды для типовых операций;
- `scripts/` - deterministic sync/verify scripts и обязательные утилиты;
- `examples/` - примеры структуры `rules/` и `epics/`;
- `update-policy.md` - формальная политика установки и обновления;
- `manifest.json` - машинное описание того, что принадлежит baseline и что
  нужно bootstrap-ить в `workspace/`.

## Ownership

- Любой файл в `baseline/` не должен настраиваться вручную под конкретный
  проект.
- Если проекту нужна кастомизация, она должна появиться в
  `ai-context/workspace/`.
- Sync-скрипт должен считать `baseline/` полностью принадлежащим
  source-of-truth и синхронизировать его как replace-only слой.
