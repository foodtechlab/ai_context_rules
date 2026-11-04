# Удалён преждевременный migration layer Design System Studio

- Время: `2026-11-04 19:35:51 +0300`
- Файлы и области:
  - `ai-context/apps/design-system-studio/data/studio.json`
  - `ai-context/baseline/apps/design-system-studio/`
  - `ai-context/baseline/templates/apps/design-system-studio/data/studio.json`
- Промт пользователя:
  ```text
  а что ты там мигрируешь? у нас пока версия 1, просто изменяй все и все
  ```
- Что сделано: семираздельная модель назначена единственной актуальной
  `schemaVersion: 1` без истории старых форматов.
- Что сделано: удалены migration registry, преобразование данных при чтении и
  записи, migration-tests и ответы API с `migratedFrom`.
- Что сделано: JSON Schema, TypeScript-контракт, starter и repo-local данные,
  UI и документация возвращены к версии 1; package version возвращена к
  `0.1.0`.
- Проверки: TypeScript strict, 4 unit tests, data validation и production build
  пройдены локально.
