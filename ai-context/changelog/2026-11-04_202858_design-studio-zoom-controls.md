# Добавлен zoom для компонентов, лейаутов и экранов

- Время: `2026-11-04 20:28:58 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/App.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/renderers.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: На экранах которые отображают компоненты,
  экраны и лейауты я хочу добавить опцию зума
  ```
- Что сделано: в правой панели разделов Components, Layouts и Screens добавлен
  единый zoom-control с диапазоном 40–160%, шагом 10%, кнопками `−/+`, slider и
  сбросом до 100%.
- Что сделано: масштаб компонентов и лейаутов применяется к рабочему контенту,
  масштаб экранов — к viewport frame с корректным пересчётом внешних размеров.
- Что сделано: три значения хранятся независимо в `localStorage`, валидируются
  при чтении и восстанавливаются после перезагрузки.
- Проверки: TypeScript, 4 unit-теста, production build и `git diff --check`
  пройдены; в headless Chrome подтверждены Screens 60% (frame 768px),
  Components 70% (`zoom: 0.7`) и Layouts 120% (`zoom: 1.2`).
