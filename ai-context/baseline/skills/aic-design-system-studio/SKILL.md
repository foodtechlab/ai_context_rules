---
name: aic-design-system-studio
description: Создавать project-owned директорию design-system, подключать неизменяемую AIC baseline library, проверять, запускать и безопасно развивать Design System Studio текущего репозитория. Использовать, когда пользователь просит установить или запустить студию, создать или изменить базовую систему, tokens, компоненты, layouts, экраны, flows и mockups либо проверить их переносимость.
---

# Design System Studio

Работать с code-first дизайн-системой текущего репозитория через неизменяемую
baseline library и отдельную проектную директорию `<project-path>/design-system`.

## Подготовка

1. Определить корень репозитория через `git rev-parse --show-toplevel`.
2. Прочитать полностью:
   - `ai-context/baseline/apps/design-system-studio/README.md`;
   - `ai-context/baseline/apps/design-system-studio/docs/project-structure.md`;
   - `ai-context/baseline/apps/design-system-studio/schemas/studio.schema.json`;
   - `ai-context/parameters/repository-parameters.yaml`.
3. Считать все файлы внутри
   `ai-context/baseline/apps/design-system-studio/` неизменяемыми в целевом
   репозитории. Не реализовывать там project-specific изменения.

Если runtime отсутствует, остановиться и предложить сначала установить или
обновить `ai-context` штатным workflow. Не создавать копию runtime вручную.

## Определение проектной директории

1. Прочитать
   `apps.catalog.design_system_studio.project_directory` из repository
   parameters.
2. Если значение задано, разрешить его относительно корня репозитория и
   проверить, что путь:
   - находится внутри репозитория;
   - заканчивается сегментом `design-system`;
   - не находится внутри `ai-context/baseline`.
3. Если параметр не задан, найти существующие `*/design-system/studio.json`,
   исключив `.git`, build output, dependencies и `ai-context/baseline`.
4. Если найден ровно один путь, использовать его и предложить записать в
   repository parameters. Если не найдено ни одного или найдено несколько,
   запросить у пользователя конкретный `<project-path>/design-system`.

Если существует legacy-файл
`ai-context/apps/design-system-studio/data/studio.json`, не продолжать работать
с ним. После выбора project directory предложить перенести модель в
`<project-path>/design-system/studio.json`, сохранив исходник до успешной
валидации нового расположения.

Не выбирать `xxx` и не придумывать принадлежность директории без контекста
целевого проекта.

## Bootstrap

Если проектная директория отсутствует, создать её по структуре из
`docs/project-structure.md` и шаблона
`ai-context/baseline/templates/apps/design-system-studio/project/`.

Обязательные директории:

```text
<project-path>/design-system/
  base-system/
  tokens/{colors,typography,parameters}/
  components/{atoms,molecules,organisms}/
  layouts/
  screens/
  flows/
  mockups/
```

Копировать только отсутствующие starter-файлы. Никогда не перезаписывать
существующие project files шаблоном. После bootstrap записать выбранный путь в
`design_system_studio.project_directory`.

Если внутри проектной директории есть JS/TS package, подключить baseline
library как local file dependency с относительным путём до
`ai-context/baseline/apps/design-system-studio`. Для Flutter, Android и iOS не
добавлять React dependency в product runtime: использовать schema и adapters.

Установить зависимости:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio install
```

## Запуск

Из корня репозитория запустить:

```bash
PROJECT_DESIGN_SYSTEM="<project-path>/design-system"
AIC_REPO_ROOT="$PWD" AIC_DESIGN_SYSTEM_DIR="$PROJECT_DESIGN_SYSTEM" \
  npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

Сообщить пользователю URL и resolved project directory из stdout. Не менять
`studio.json` только ради запуска приложения.

## Изменение дизайн-системы

- Канонический контракт — `<project-path>/design-system/studio.json`, а не
  baseline React runtime.
- Реализации и документацию раскладывать по семи project-owned директориям;
  компоненты реализовывать только в `components/atoms`, `molecules` или
  `organisms`.
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
AIC_REPO_ROOT="$PWD" AIC_DESIGN_SYSTEM_DIR="$PROJECT_DESIGN_SYSTEM" \
  npm --prefix ai-context/baseline/apps/design-system-studio run validate:data
npm --prefix ai-context/baseline/apps/design-system-studio run typecheck
npm --prefix ai-context/baseline/apps/design-system-studio test
npm --prefix ai-context/baseline/apps/design-system-studio run build
```

При ошибке не записывать поверх валидной модели непроверенный JSON. Сообщить
точные broken references или schema violations.

## Границы

- Не редактировать ни один файл в baseline runtime ради project-specific
  цвета, токена, layout, экрана, flow, mockup или компонента.
- Не хранить проектную дизайн-систему в
  `ai-context/apps/design-system-studio/`.
- Не перезаписывать repo-local данные при повторном запуске или обновлении.
- Не включать Studio в production bundle основного продукта.
- Не изменять product code и generated platform files без отдельного запроса.
- Не делать commit или push без явного запроса пользователя.

## Результат

Коротко сообщить использованный data path, URL запуска, выбранную base system,
количество themes, components, layouts, screens, flows и mockups, результат
проверок, открытые вопросы и ограничения выбранного export adapter.
