# Добавлены настройки разрешений Design System Studio

- Время: `2026-11-04 20:34:37 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/`
  - `ai-context/baseline/apps/design-system-studio/schemas/studio.schema.json`
  - `ai-context/baseline/apps/design-system-studio/tests/`
  - `ai-context/baseline/templates/apps/design-system-studio/project/studio.json`
  - `examples/design-system-example/studio.json`
  - `ai-context/baseline/apps/design-system-studio/README.md`
  - `ai-context/baseline/apps/design-system-studio/docs/project-structure.md`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: давай добавим настройки и туда внесем
  настройки по умолчанию разрешений экранов

  Давай править саму дизайн студию: для экранов добавь по умолчанию разрешения
  iPhone, Android, MacBook и Desktop из переданной таблицы.
  ```
- Что сделано: в file tree добавлен пункт `settings`, открывающий project-owned
  редактор viewport presets.
- Что сделано: добавлены 14 исходных presets: 7 Mobile и 7 Desktop. Для каждого
  сохраняются название, ширина, высота и назначение проверки; все поля доступны
  в настройках, а `iPhone 13 / 14` выбран как базовое разрешение.
- Что сделано: selectors экранов и mockup показывают полный каталог с группами
  Mobile/Desktop, поэтому любой экран можно проверить во всех заданных размерах.
- Что сделано: screen previews, flow nodes и mockups разрешают viewport ids из
  настроек вместо жёсткого enum и используют заданные проектом размеры.
- Что сделано: schema v1 расширена backward-compatible optional-блоком
  `settings`; прежние ссылки `phone`, `tablet` и `desktop` продолжают работать
  в существующих экранах и flow как legacy aliases.
- Что сделано: starter template, empty model, public API, schema и
  cross-reference validation обновлены; неизвестные viewport ids отклоняются.
- Проверки: TypeScript, 4 unit-теста, model validation для примера админ-панели,
  production build, JSON parsing и `git diff --check` пройдены. В unit-тесте
  дополнительно зафиксированы 14 presets и default `iphone-13-14`.
