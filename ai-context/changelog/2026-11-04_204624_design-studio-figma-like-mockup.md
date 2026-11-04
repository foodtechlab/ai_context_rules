# Mockup переведён в Figma-like canvas

- Время: `2026-11-04 20:46:24 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/App.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
  - `ai-context/baseline/apps/design-system-studio/README.md`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: мне не нравится режим мокап. давай сделаем
  что-то приближенное к фигме
  ```
- Что сделано: прежний центрированный preview заменён prototype-canvas с
  тёмным точечным полем, выделенным frame, подписью экрана, state и viewport.
- Что сделано: добавлены рабочие режимы `Курсор` и `Рука`; в режиме руки canvas
  перемещается pointer drag, а интерактивные элементы frame временно отключены.
- Что сделано: добавлены zoom −/+/100%, `Ctrl/Cmd + wheel`, команда `Fit`,
  сохранение масштаба в localStorage и компактная верхняя prototype-панель.
- Что сделано: перезапуск сценария доступен и на canvas, и в правой панели;
  существующие переходы, fixtures, возврат и выбор viewport сохранены.
- Проверки: TypeScript, 4 unit-теста, model validation примера, production
  build и `git diff --check` пройдены. Mockup визуально проверен в headless
  Chrome при 1600×1000 на frame `Desktop Full HD` 1920×1080.
