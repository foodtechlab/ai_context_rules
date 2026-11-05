# Design System Studio Project Template

Этот template копируется skill-ом в выбранную именованную директорию вида
`design-system/<id>/`. Он не используется прямо из baseline.

- `project/design-system.json` — project-wide manifest без коллекций сущностей.
- Каждый token, component, layout, screen, flow и mockup уже разложен в
  отдельный `<id>.json`.
- `project/` повторяет семь разделов дизайн-системы и содержит места для
  project-owned реализаций.
- Skill копирует только отсутствующие файлы и не обновляет существующий
  проектный дизайн шаблоном.

Runtime находится в `ai-context/baseline/apps/design-system-studio/`.
