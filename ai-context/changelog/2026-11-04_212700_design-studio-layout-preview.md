# Layout отображается как container-компонент

- Время: `2026-11-04 21:27:00 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/App.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/renderers.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
  - `ai-context/baseline/apps/design-system-studio/src/data-model.mjs`
  - `ai-context/baseline/apps/design-system-studio/schemas/studio.schema.json`
  - `ai-context/baseline/skills/aic-design-system-studio/SKILL.md`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: или контент - мне не нрваится как сейчас
  выглядят layout - они вообще не понятны - это должен быть обычный копонент,
  который на вход принимает какой-то контент. в отображении layout сейчас можно
  просто в к ачестве дочернего контента использовать что-то типа placeholder во
  флаттер, где просто квадртат с перечеркиванием
  ```
- Что сделано: список технических regions заменён отдельной визуальной страницей
  layout с desktop и mobile frames на точечном canvas.
- Что сделано: добавлен `LayoutPreview`, который работает как container-
  компонент и принимает `children` в именованный slot `content`; в Studio туда
  передаётся нейтральный placeholder с диагональным крестом.
- Что сделано: navigation, top bar и optional slots также визуально обозначены,
  а width, scroll, safe-area, responsive rules и tokens перенесены в правую
  информационную панель.
- Что сделано: schema, runtime validation, starter documentation и skill теперь
  требуют у каждого layout region `content`; screen blocks проверяются на ссылку
  только на существующий region выбранного layout.
- Проверки: TypeScript, 9 unit-тестов, production build и визуальный headless
  Chrome screenshot для `Admin Shell` пройдены.
