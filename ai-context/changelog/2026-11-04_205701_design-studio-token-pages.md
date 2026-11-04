# Tokens разделены на самостоятельные страницы

- Время: `2026-11-04 20:57:01 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/App.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
  - `ai-context/baseline/apps/design-system-studio/README.md`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: давай tokens разделим что бы это не была
  одна огромная страница; пусть шрифты это будет отдна страница, типографика
  другая а цвета третья
  ```
- Что сделано: Tokens разделён на самостоятельные маршруты Colors, Fonts,
  Typography и Parameters; одновременно отображается только одна страница.
- Что сделано: file tree и плоский переключатель страниц показывают количество
  токенов в каждом разделе и сохраняют выбранную страницу в URL.
- Что сделано: Fonts содержит family и weight из существующего
  `tokens.typography`, а Typography — size, line-height и составные text styles.
  Формат `studio.json` не изменён и данные не дублируются.
- Что сделано: tier без токенов скрывается, поэтому на странице нет пустых
  секций и лишней вертикальной прокрутки.
- Проверки: TypeScript, 4 unit-теста, production build и `git diff --check`
  пройдены. Прямые маршруты Colors, Fonts и Typography визуально проверены в
  headless Chrome при 1600×1000; Fonts показал 5, Typography 9, Colors 26,
  Parameters 31 token.
