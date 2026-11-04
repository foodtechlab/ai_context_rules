# Zoom перенесён вниз рабочей области

- Время: `2026-11-04 21:06:16 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/App.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
  - `ai-context/baseline/apps/design-system-studio/README.md`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: мне не нравится что зум сейчас находится в
  инструментах. добавь его или вниз экрана или на верхнюю панель
  сделай коммит и пуш
  ```
- Что сделано: zoom Components, Layouts и Screens удалён из правой панели
  инструментов и размещён плавающим control внизу рабочей области.
- Что сделано: control содержит уменьшение, slider, увеличение и текущее
  значение; нажатие на процент сбрасывает масштаб к 100%.
- Что сделано: сохранены отдельные localStorage-значения масштаба для каждого
  раздела; нижний Mockup zoom оставлен без изменений.
- Проверки: TypeScript, 4 unit-теста и production build пройдены. Размещение
  zoom визуально проверено в headless Chrome при 1600×1000 на отдельной
  странице компонента и на мобильном screen preview.
