# Зафиксирован one-click запуск Design System Studio

- Время: `2026-11-04 20:06:12 +0300`
- Файлы и области:
  - `.vscode/launch.json`
  - `README.md`
  - `examples/design-system-example/README.md`
  - `ai-context/baseline/apps/design-system-studio/README.md`
  - `ai-context/baseline/apps/design-system-studio/docs/project-structure.md`
  - `ai-context/baseline/guides/apps.md`
  - `ai-context/baseline/skills/aic-design-system-studio/SKILL.md`
- Промт пользователя:
  ```text
  так, давай подправим - схема где vs чтото ждет не удобная
  давай сразу в доки засунем что нужно сразу делать все запуском с одной кнопики
  ```
- Что сделано: пользовательский стандарт изменён на один запуск `F5` через
  конфигурацию `AIC: design-system-studio` без дополнительных вопросов.
- Что сделано: project path определяется при bootstrap и сохраняется literal
  значением в launch-конфигурации; `${input:...}` и `promptString` для запуска
  Studio запрещены.
- Что сделано: skill обязан сохранить посторонние конфигурации VS Code,
  настроить видимый install task, запустить сервер и автоматически открыть
  браузер через `serverReadyAction`.
- Что сделано: в текущем репозитории удалены дублирующая конфигурация примера и
  ожидающая ввода универсальная конфигурация; оставлена одна готовая кнопка.
- Проверки: launch/tasks JSON разобраны без ошибок, интерактивные inputs
  отсутствуют, skill прошёл официальный `quick_validate.py`, `git diff
  --check` пройден.
