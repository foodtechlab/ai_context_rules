# Стандарт AI Context Apps

- Время: `2026-09-12 08:54:34 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/README.md`
  - `ai-context/baseline/guides/apps.md`
  - `ai-context/baseline/ai-rules/012_ai-context-apps.md`
  - `ai-context/baseline/templates/apps/README.md`
  - `ai-context/apps/README.md`
  - `ai-context/baseline/manifest.json`
  - repository parameters, update policy и обзорные README
- Промт пользователя:
  ```text
  Мне очень нравится apps — давай зафиксируем этот стандарт. Создай его пока в
  качестве описания, но без конкретных приложений.
  ```
- Что сделано: `apps` закреплен как стандартное имя для AI-operational
  приложений внутри `ai-context`.
- Что сделано: определена граница между replaceable `baseline/apps` для
  будущих переносимых templates/schemas и repo-local `apps` для приложений и
  данных текущего репозитория.
- Что сделано: добавлены naming, минимальный контракт приложения, ownership и
  bootstrap только корневого `apps/README.md`; конкретные приложения не
  создавались.
- Проверки: sync создает `ai-context/apps/README.md` в пустом репозитории,
  сохраняет существующие repo-local файлы при повторном запуске, baseline
  verify и `git diff --check` проходят.
