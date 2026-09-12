# Repository skills в `ai-context`

- Время: `2026-09-12 08:09:15 +0300`
- Файлы и области:
  - `ai-context/baseline/skills/**/*`
  - `ai-context/baseline/scripts/*skills*.py`
  - `ai-context/baseline/guides/skills.md`
  - `ai-context/baseline/promts/install-ai-context-skills-prompt.md`
  - `ai-context/baseline/ai-rules/011_repository-skills.md`
  - `ai-context/baseline/manifest.json`
  - `ai-context/baseline/templates/skills/**/*`
  - `ai-context/skills/imports/README.md`
  - repository parameters и обзорные README
- Промты пользователя:
  ```text
  Предложи вариант хранения skills в ai-context, чтобы переносить их в целевые
  репозитории, включая skills из других репозиториев.

  Зафиксировать финальный вариант: только repository scope; отдельный
  baseline-каталог и skills manifest; префиксы `aic-` и `AIC: `; установка по
  фразам «установи скилы» и «установи скиллы из ai-context»; повторная
  установка обновляет skills из корневого source-of-truth; перенести и
  обезличить backend skill из исходного репозитория.
  ```
- Что сделано: создан канонический каталог `baseline/skills` с JSON manifest и
  универсальным `aic-backend-review-and-fix`.
- Что сделано: добавлены deterministic install/verify scripts для
  `.agents/skills`, install state и защита сторонних skills.
- Что сделано: добавлены repo-local import staging, AI prompt-триггеры, правило,
  guide, параметры и документация ownership/update workflow.
- Проверки: установка поверх существующей копии, повторная идемпотентная
  установка, сохранение стороннего skill, skills verify, baseline verify,
  JSON/Python syntax и `git diff --check`.
