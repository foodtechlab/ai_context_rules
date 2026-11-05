# Дизайн-системы получили именованные директории

- Время: `2026-11-05 15:54:07 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/project-path.mjs`
  - `ai-context/baseline/apps/design-system-studio/server.mjs`
  - `ai-context/baseline/apps/design-system-studio/scripts/validate-data.mjs`
  - `ai-context/baseline/skills/aic-design-system-studio/SKILL.md`
  - `ai-context/baseline/apps/design-system-studio/docs/project-structure.md`
  - `design-system/admin-console/`
  - `.vscode/launch.json`
- Промт пользователя:
  ```text
  Смотри, сейчас дизайн студия требует что бы рабочая директория оканчивалась
  на design-system

  Мне это не нравится. Путь должен быть: /design-system/XXX

  Где xxx может быть несколько разных дизайн систем

  Исправь это и сделай сразу коммит и пуш
  ```
- Что сделано: обязательный project-owned layout изменён на
  `design-system/<id>`, поэтому в одном репозитории могут независимо жить
  несколько дизайн-систем.
- Что сделано: общий resolver проверяет, что путь находится внутри
  репозитория, состоит ровно из `design-system/<id>` и использует portable id;
  server и validator используют одну и ту же проверку.
- Что сделано: прежние suffix-based пути и исключение для `examples` удалены и
  намеренно отклоняются тестами.
- Что сделано: admin example перенесён из `examples/design-system-example` в
  `design-system/admin-console`; VS Code и repository parameters обновлены.
- Что сделано: tree Studio показывает id выбранной системы, а skill,
  документация, template comments и maintainer task закрепляют новый стандарт.
- Проверки: unit-тесты, TypeScript, production build, data validation, запуск
  новой директории и отрицательная проверка старого пути пройдены.
