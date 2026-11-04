# Design System Studio

Code-first React-приложение для семи связанных разделов дизайн-системы:
базовая система, tokens, компоненты, layouts, экраны, flows и mockups.

## Ownership

- Все файлы в `ai-context/baseline/apps/design-system-studio/` принадлежат
  baseline, считаются неизменяемыми в целевом репозитории и могут быть целиком
  заменены при обновлении AI Context.
- Дизайн и реализации текущего проекта находятся вне `ai-context/baseline` в
  настраиваемой директории вида `<project-path>/design-system/`.
- Проектная директория использует runtime/library из baseline, но не копирует и
  не изменяет её.
- Полный обязательный layout описан в
  [`docs/project-structure.md`](docs/project-structure.md).

## Запуск

Стандартный пользовательский запуск — конфигурация VS Code
`AIC: design-system-studio`: один `F5` устанавливает зависимости, запускает
сервер и автоматически открывает браузер. Project path определяется при
bootstrap и записывается в launch-конфигурацию; интерактивный запрос пути при
запуске запрещён. Требования описаны в
[`docs/project-structure.md`](docs/project-structure.md).

Командный эквивалент для диагностики и CI:

Из корня целевого репозитория:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio install
AIC_REPO_ROOT="$PWD" AIC_DESIGN_SYSTEM_DIR="<project-path>/design-system" \
  npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

Открыть `http://localhost:4174`.

В правой панели всегда доступен готовый AI-промт для реализации компонента.
Компонент можно выбрать в самом инструменте; выбор элемента в дереве
`components` синхронизирует промт автоматически. Кнопка копирования добавляет
абсолютный локальный путь к отдельному definition-файлу выбранного компонента,
например `components/atoms/button.json`.

Проверки:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio run typecheck
npm --prefix ai-context/baseline/apps/design-system-studio test
AIC_REPO_ROOT="$PWD" AIC_DESIGN_SYSTEM_DIR="<project-path>/design-system" \
  npm --prefix ai-context/baseline/apps/design-system-studio run validate:data
npm --prefix ai-context/baseline/apps/design-system-studio run build
```

Production-like запуск:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio run build
AIC_REPO_ROOT="$PWD" AIC_DESIGN_SYSTEM_DIR="<project-path>/design-system" \
  npm --prefix ai-context/baseline/apps/design-system-studio start
```

Порт меняется через `PORT`.

## Модель

`<project-path>/design-system/` содержит обязательную versioned
platform-neutral модель в отдельных project-owned файлах:

- project settings: default viewport и именованные Mobile/Desktop presets с
  шириной, высотой и назначением проверки; Studio по умолчанию поставляется с
  14 профилями от iPhone SE и Android Compact до Desktop QHD;
- base design system, её версию, наследуемые решения и overrides;
- базовые, семантические и компонентные tokens по цветам, типографике и
  остальным параметрам;
- atoms, molecules и organisms с зависимостями, states и accessibility;
- reusable layouts с regions, navigation, scroll и responsive rules;
- screens и применимые screen states;
- React Flow flows с условиями, ветвлениями и recovery;
- воспроизводимые mockups с fixtures и границей implemented/simulated;
- adapter settings.

Mockup открывается в отдельном prototype-canvas, близком к графическим
редакторам: frame экрана расположен на бесконечном точечном поле, режим
`Курсор` оставляет интерфейс интерактивным, а режим `Рука` перемещает canvas.
Масштаб меняется кнопками, `Ctrl/Cmd + wheel` или командой `Fit`; выбранный
масштаб сохраняется локально между перезапусками Studio.

На страницах Components, Layouts и Screens масштаб вынесен из правой панели в
единый с Mockup компактный control внизу справа: `−`, текущее значение и `+`.
Нажатие на процент возвращает 100%. Каждый раздел сохраняет свой масштаб в
localStorage.

Screen и Mockup preview всегда имеют точные размеры выбранного viewport preset:
контент не увеличивает высоту frame. Если содержимое превышает высоту viewport,
оно прокручивается внутри самого экрана. Compact previews на flow-карте имеют
те же фиксированные пропорции, но скрывают внутренний scrollbar.

Layout моделируется и отображается как обычный переиспользуемый container-
компонент. Он обязан иметь region `content`, принимает дочерний контент в этот
slot и не хранит внутри себя содержимое конкретного экрана. На отдельной
странице layout Studio показывает desktop и mobile frames; вместо screen-
контента передаётся нейтральный placeholder с диагональным крестом. Остальные
regions визуализируют navigation, top bar и optional slots, а технические
правила остаются в правой панели.

Текущий формат — `schemaVersion: 1`. Migration layer пока отсутствует: до
первого стабильного релиза структура v1 изменяется напрямую. JSON с другим
номером версии отклоняется валидацией.

Связи валидируются в направлении base system → tokens/components → layouts →
screens → flows → mockups. Неопределённые решения сохраняются в
`openQuestions`, а не замалчиваются и не заполняются догадками.

Раздел Components состоит из каталога atoms/molecules/organisms и отдельных
страниц компонентов. Страница компонента имеет устойчивый маршрут
`#/components/component-<id>` и показывает только его варианты и состояния:
каждая комбинация размещается отдельным frame на точечном canvas. Описание,
dependencies, properties, tokens, accessibility и ограничения остаются в
правой панели, не загромождая рабочую область.

Tokens не образуют одну длинную страницу: Studio предоставляет отдельные
маршруты Colors, Fonts, Typography и Parameters. Fonts является UI-
представлением family/weight токенов из `tokens.typography`, поэтому schema v1
и project-owned данные не дублируются. Typography содержит оставшиеся размеры,
line-height и составные text styles. Fonts и Typography показываются плоским
font-browser списком, по одному токену на строку, и применяют значения к живому
sample-тексту. Общий текст проверки сохраняется в localStorage только как
пользовательская настройка Studio; token values по-прежнему записываются в
соответствующий token-файл.

Каждая тема, token, component, layout, screen, flow и mockup хранится в
отдельном `<id>.json`. `design-system.json` содержит только общие metadata,
settings и adapter settings; `studio.json` запрещён. Полный обязательный layout
и правило «одна сущность — один файл» описаны в `docs/project-structure.md`.

Изменения из UI проходят reference validation и атомарно раскладываются обратно
по отдельным проектным файлам. JSON-редактор показывает только временное
сводное представление и не создаёт монолитный файл.

## Platform adapters

- Web/React — reference renderer и CSS tokens export.
- Flutter — proof-of-concept Dart token export.
- Android/Compose — proof-of-concept Kotlin token export.
- iOS/SwiftUI — proof-of-concept Swift token export.

Adapters не обещают автоматический production parity. Граница и последствия
описаны в `docs/adr-001-portable-model.md`.

## Безопасность

- JSON не выполняется через `eval`.
- Runtime пишет только в переданную через `AIC_DESIGN_SYSTEM_DIR` проектную
  директорию внутри репозитория и запрещает путь в `ai-context/baseline`.
- Ошибочные references блокируют запись и возвращают диагностику.
- Product runtime не зависит от studio и не включает его в production bundle.
