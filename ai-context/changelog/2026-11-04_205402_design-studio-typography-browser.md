# Typography представлена как font browser

- Время: `2026-11-04 20:54:02 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/src/App.tsx`
  - `ai-context/baseline/apps/design-system-studio/src/styles.css`
  - `ai-context/baseline/apps/design-system-studio/README.md`
- Промт пользователя:
  ```text
  Давай править саму дизайн студию: мне не нравится как отображается
  типографика. вообще ничего не понятно. давай сделаем ближе к google fonts -
  мне там текст ане хватает. И все в какихто квадратиках, это тоже путает.
  лучше один тип шрифта одна строчка
  ```
- Что сделано: карточная сетка Typography заменена плоским светлым списком в
  стиле font browser; один typography token занимает одну строку.
- Что сделано: в каждой строке показаны имя, id, назначение, крупный живой
  preview и редактируемое token value.
- Что сделано: family, weight, size, line-height и CSS font shorthand
  распознаются и реально применяются к preview.
- Что сделано: добавлен единый редактируемый sample-текст для всех строк; он
  сохраняется в localStorage и не изменяет данные дизайн-системы.
- Что сделано: прямое открытие `#/tokens/tokens-typography` теперь прокручивает
  рабочую область к Typography, как и выбор раздела в file tree.
- Проверки: TypeScript, 4 unit-теста, production build и `git diff --check`
  пройдены. Typography с 14 токенами визуально проверена в headless Chrome при
  1600×1000.
