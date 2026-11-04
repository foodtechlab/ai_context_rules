# Проектная дизайн-система отделена от immutable baseline library

- Время: `2026-11-04 19:43:18 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/`
  - `ai-context/baseline/templates/apps/design-system-studio/`
  - `ai-context/baseline/skills/aic-design-system-studio/SKILL.md`
  - `ai-context/baseline/guides/apps.md`
  - `ai-context/baseline/manifest.json`
  - `ai-context/baseline/update-policy.md`
  - `ai-context/parameters/repository-parameters.yaml`
  - `ai-context/baseline/templates/repository-parameters.yaml`
  - `ai-context/apps/`
  - `.vscode/launch.json`
  - `README.md`
  - `maintainer-context/tasks/task-details/01-001.md`
- Промт пользователя:
  ```text
  зафиксируй в документации, скилах что дизайн студия используется следующим
  образом: в baseline/apps/design-system-studio лежат не изменяемые файлы
  внутри репозитария нужно создать директорию вида xxx/design-system - внутри
  будет использоваться библиотека из baseline и уже внутри будут реализованы
  все компоненты дизайн системы. причем локальная директория уже для проекта
  тоже должна сохранять структуру дизайн системы которую я поисал выше
  ```
- Что сделано: baseline Design System Studio объявлен immutable runtime/library;
  project-specific реализация перенесена в стандартную настраиваемую директорию
  `<project-path>/design-system/` вне `ai-context/baseline`.
- Что сделано: project template физически повторяет семь разделов, token groups
  и atomic component classification; baseline package получил public exports.
- Что сделано: skill определяет или запрашивает project path, bootstrap-ит
  только отсутствующие файлы, подключает baseline library и запрещает
  project-specific изменения baseline.
- Что сделано: runtime и validator требуют `AIC_DESIGN_SYSTEM_DIR`, проверяют
  границы репозитория и блокируют запись в baseline; VS Code запрашивает путь.
- Что сделано: автоматический bootstrap старого
  `ai-context/apps/design-system-studio` удалён из manifest и update policy.
- Проверки: TypeScript, 4 unit tests, production build, skill validation,
  project-directory API persistence, immutable-baseline guard и sync/verify
  пройдены локально.
