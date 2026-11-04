# Screen preview получил фиксированную высоту viewport

- Время: `2026-11-04 21:08:48 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/renderers.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
  - `ai-context/baseline/apps/design-system-studio/README.md`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: сейчас когда я смотрю экран, сам экран
  выглядит длинным в высоту. хотя я выбрал вариант десктопа. скорее всего он
  расширяется автоматически. так не долджно быть. экран должен отображаться как
  реальный экран, как следствие там должен быть скрол, если контент самого
  экрана бльше;
  ```
- Что сделано: `minHeight` wrapper и preview заменён точными `width × height`
  выбранного viewport preset; контент больше не растягивает desktop frame.
- Что сделано: overflow перенесён внутрь `.screen-preview`, включены внутренний
  scroll, controlled overscroll и тонкий тематический scrollbar.
- Что сделано: compact previews сохраняют фиксированные пропорции, но скрывают
  scrollbar и остаются неинтерактивными на flow-карте.
- Проверки: TypeScript, 4 unit-теста и production build пройдены. `Laptop
  Small` визуально проверен в headless Chrome; CDP-проверка с искусственным
  высоким контентом подтвердила `frameHeight=720`, `clientHeight=720`,
  `scrollHeight=2091`, `overflowY=auto` и рабочий `scrollTop=500`.
