---
name: aic-design-system-studio
description: Создавать project-owned директорию design-system, подключать неизменяемую AIC baseline library, проверять, запускать и безопасно развивать Design System Studio текущего репозитория. Использовать, когда пользователь просит установить или запустить студию, создать или изменить базовую систему, tokens, компоненты, layouts, экраны, flows и mockups либо проверить их переносимость.
---

# Design System Studio

Работать с code-first дизайн-системой текущего репозитория через неизменяемую
baseline library и отдельную именованную директорию `design-system/<id>`.

## Подготовка

1. Определить корень репозитория через `git rev-parse --show-toplevel`.
2. Прочитать полностью:
   - `ai-context/baseline/apps/design-system-studio/README.md`;
   - `ai-context/baseline/apps/design-system-studio/docs/project-structure.md`;
   - `ai-context/baseline/apps/design-system-studio/schemas/studio.schema.json`;
   - `ai-context/baseline/apps/design-system-studio/schemas/project.schema.json`;
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
   - имеет ровно два сегмента `design-system/<id>` от корня репозитория;
   - `<id>` является portable именем: буквы, цифры, `.`, `_` и `-`;
   - не указывает на сам каталог `design-system` без id.
3. Если параметр не задан, найти существующие
   `design-system/*/design-system.json`, исключив build output и dependencies.
4. Если найден ровно один путь, использовать его и предложить записать в
   repository parameters. Если не найдено ни одного или найдено несколько,
   запросить у пользователя конкретный `design-system/<id>`.

Если в выбранной директории существует legacy `studio.json`, не запускать
Studio и не редактировать монолит. Разделить его штатной командой `split:data`,
проверить новую файловую структуру и только после успешной валидации продолжить.

Не выбирать `xxx` и не придумывать принадлежность директории без контекста
целевого проекта.

## Bootstrap

Если проектная директория отсутствует, создать её по структуре из
`docs/project-structure.md` и шаблона
`ai-context/baseline/templates/apps/design-system-studio/project/`.

Обязательные директории:

```text
design-system/<id>/
  design-system.json
  base-system/base-system.json
  tokens/themes/
  tokens/{colors,typography,parameters}/{base,semantic,component}/
  components/{atoms,molecules,organisms}/
  layouts/
  screens/
  flows/
  mockups/
```

Копировать только отсутствующие starter-файлы. Никогда не перезаписывать
существующие project files шаблоном. После bootstrap записать выбранный путь в
`design_system_studio.project_directory`.

Настроить one-click запуск в `.vscode/launch.json` и `.vscode/tasks.json`:

- конфигурация называется `AIC: design-system-studio`;
- `AIC_DESIGN_SYSTEM_DIR` содержит resolved repo-relative project path как
  литерал, а не `${input:...}` и не иной интерактивный prompt;
- pre-launch task устанавливает зависимости baseline runtime и показывает
  прогресс в integrated terminal;
- `serverReadyAction` открывает URL из строки `Design System Studio: ...` во
  внешнем браузере;
- один `F5` полностью выполняет install → start → open browser без
  дополнительных вопросов пользователю.

Сохранять остальные пользовательские launch/tasks-конфигурации. При изменении
`project_directory` синхронно обновлять literal path в launch-конфигурации.

Если внутри проектной директории есть JS/TS package, подключить baseline
library как local file dependency с относительным путём до
`ai-context/baseline/apps/design-system-studio`. Для Flutter, Android и iOS не
добавлять React dependency в product runtime: использовать schema и adapters.

Установить зависимости:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio install
```

## Запуск

Основной пользовательский способ запуска — один `F5` через готовую
конфигурацию `AIC: design-system-studio`. Не просить пользователя вводить путь
при каждом запуске. Командный запуск ниже использовать для диагностики и CI.

Из корня репозитория запустить:

```bash
PROJECT_DESIGN_SYSTEM="design-system/<id>"
AIC_REPO_ROOT="$PWD" AIC_DESIGN_SYSTEM_DIR="$PROJECT_DESIGN_SYSTEM" \
  npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

Сообщить пользователю URL и resolved project directory из stdout. Не создавать
монолитный `studio.json` ради запуска приложения.

## Изменение дизайн-системы

- Канонический контракт — отдельные файлы внутри
  `design-system/<id>/`, а не baseline React runtime и не агрегат.
- Жёстко соблюдать правило «одна сущность — один файл»: одна theme, token,
  component, layout, screen, flow или mockup записывается только в собственный
  `<id>.json`. Имя файла обязано совпадать с `id`.
- `design-system.json` содержит только schemaVersion, meta, settings и
  adapterSettings. Запрещено помещать туда массивы сущностей или создавать
  `studio.json`.
- Definition и реализация компонента являются project-owned файлами. Для
  каждой реализации использовать отдельный source-файл; barrel-файл может
  только реэкспортировать и не должен содержать несколько компонентов.
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
- Layout проектировать как переиспользуемый container-компонент с обязательным
  region `content`: он принимает children экрана и не содержит product content
  конкретного экрана. Остальные regions являются именованными slots.
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
- Не объединять несколько сущностей в одном JSON или source-файле даже для
  маленького примера, starter template или временной реализации.
- Не перезаписывать repo-local данные при повторном запуске или обновлении.
- Не включать Studio в production bundle основного продукта.
- Не изменять product code и generated platform files без отдельного запроса.
- Не делать commit или push без явного запроса пользователя.

## Результат

Коротко сообщить использованный data path, URL запуска, выбранную base system,
количество themes, components, layouts, screens, flows и mockups, результат
проверок, открытые вопросы и ограничения выбранного export adapter.
