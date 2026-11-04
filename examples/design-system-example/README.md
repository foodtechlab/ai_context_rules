# Admin Console Design System Example

Project-owned пример дизайн-системы адаптивной административной панели. Он
использует immutable library из
`ai-context/baseline/apps/design-system-studio/` и не изменяет baseline.

## Экраны

- Login и Registration.
- Dashboard.
- Users list, Create user и User details.
- Ошибки 404 и 500.

Каждый экран поддерживает `phone`, `tablet` и `desktop`, а mockup можно
переключать между этими viewport и темами.

## Запуск

Из корня репозитория:

```bash
npm --prefix ai-context/baseline/apps/design-system-studio install
AIC_REPO_ROOT="$PWD" AIC_DESIGN_SYSTEM_DIR="examples/design-system-example" \
  npm --prefix ai-context/baseline/apps/design-system-studio run dev
```

Открыть `http://localhost:4174`.

В VS Code можно выбрать конфигурацию `AIC: design-system-example` в разделе
Run and Debug и нажать `F5`. Путь вводить не нужно: после установки
зависимостей браузер откроется автоматически.

Локальные React-компоненты находятся в `components/`, а `studio.json` является
каноническим индексом состояний, экранов, flows и mockup fixtures.
