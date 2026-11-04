# Design System Studio переведена на трёхпанельную структуру

- Время: `2026-11-04 20:12:55 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/App.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: Меню должно быть одно с левой стороны -
  там должна быть полностью структура проекта. Инструменты проверки должны
  быть с правой стороны
  ```
- Что сделано: Studio разделена на постоянное дерево проекта слева, рабочую
  область по центру и единую панель инструментов справа.
- Что сделано: дерево показывает семь разделов и вложенные token groups,
  component classifications и components, layouts, screens, flows и mockups.
- Что сделано: выбор screen, flow и mockup перенесён в дерево; дополнительные
  левые select-панели удалены.
- Что сделано: screen states и viewport, flow metadata, mockup fixtures,
  viewport, restart/back и границы simulated/implemented перенесены вправо.
- Что сделано: JSON editor, adapter export, reload и theme также собраны в
  правой панели, поэтому слева осталось только одно проектное меню.
- Что сделано: активная вложенная сущность автоматически прокручивается в
  видимую область дерева.
- Проверки: TypeScript, 4 unit-теста, production build, `git diff --check` и
  headless Chrome screenshots для screen и mockup режимов пройдены локально.
