---
name: aic-design-system-studio
description: Устанавливать repo-local данные, проверять, запускать и безопасно развивать AIC Design System Studio текущего репозитория. Использовать, когда пользователь просит запустить студию дизайн-системы, создать или изменить базовую систему, tokens, компоненты, layouts, экраны, flows и mockups либо проверить их переносимость.
---

# Design System Studio

Работать с code-first дизайн-системой текущего репозитория через переносимый
runtime и repo-local source data.

## Подготовка

1. Определить корень репозитория через `git rev-parse --show-toplevel`.
2. Прочитать полностью:
   - `ai-context/baseline/apps/design-system-studio/README.md`;
   - `ai-context/baseline/apps/design-system-studio/schemas/studio.schema.json`;
   - `ai-context/apps/design-system-studio/README.md`, если файл существует.
3. Считать runtime внутри `baseline` replaceable, а содержимое
   `ai-context/apps/design-system-studio/` принадлежащим текущему репозиторию.

Если runtime отсутствует, остановиться и предложить сначала установить или
обновить `ai-context` штатным workflow. Не создавать копию runtime вручную.

## Bootstrap

Если repo-local `data/studio.json` отсутствует, скопировать только отсутствующие
файлы из `ai-context/baseline/templates/apps/design-system-studio/`. Никогда не
перезаписывать существующий дизайн шаблоном.

Установить зависимости:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio install
```

## Запуск

Из корня репозитория запустить:

```bash
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

Сообщить пользователю URL из stdout. Не менять `studio.json` только ради
запуска приложения.

## Изменение дизайн-системы

- Канонический контракт — repo-local `data/studio.json`, а не React runtime.
- Использовать стабильные ids и существующую `schemaVersion`.
- Сохранять семь обязательных разделов: `baseSystem`, `tokens`, `components`,
  `layouts`, `screens`, `flows`, `mockups`.
- Токены разделять на colors, typography и parameters, а внутри — на base,
  semantic и component; ссылки направлять от component к semantic и от
  semantic к base.
- Компоненты классифицировать как atom, molecule или organism и описывать через
  registry kind, dependencies, variants, states и accessibility metadata.
- Экран должен ссылаться на существующий layout, а layout — на существующие
  tokens и navigation components.
- Каждый экран должен ссылаться только на существующие компоненты и содержать
  воспроизводимые states и viewport presets.
- Flow должен ссылаться только на существующие screen states; именованные
  `actionId` связывают интерактивный блок с transition.
- Mockup должен ссылаться на flow, использовать воспроизводимые fixtures и
  явно разделять implemented и simulated interactions.
- Недостающую продуктовую информацию фиксировать в `openQuestions`, не
  заменять догадкой.
- Не использовать `eval`, executable strings или скрытые сетевые зависимости.
- Не обещать автоматический production parity между Web, Flutter, Compose и
  SwiftUI: проверять capability matrix и явно называть ограничения adapters.

После изменения выполнить:

```bash
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/design-system-studio run validate:data
npm --prefix ai-context/baseline/apps/design-system-studio run typecheck
npm --prefix ai-context/baseline/apps/design-system-studio test
npm --prefix ai-context/baseline/apps/design-system-studio run build
```

При ошибке не записывать поверх валидной модели непроверенный JSON. Сообщить
точные broken references или schema violations.

## Границы

- Не редактировать runtime ради project-specific цвета, экрана или компонента.
- Не перезаписывать repo-local данные при повторном запуске или обновлении.
- Не включать Studio в production bundle основного продукта.
- Не изменять product code и generated platform files без отдельного запроса.
- Не делать commit или push без явного запроса пользователя.

## Результат

Коротко сообщить использованный data path, URL запуска, выбранную base system,
количество themes, components, layouts, screens, flows и mockups, результат
проверок, открытые вопросы и ограничения выбранного export adapter.
