# Skill для обновления `ai-context`

- Время: `2026-09-12 08:32:59 +0300`
- Файлы и области:
  - `ai-context/baseline/skills/aic-update-ai-context/**/*`
  - `ai-context/baseline/skills/manifest.json`
  - `ai-context/baseline/skills/README.md`
  - `ai-context/baseline/promts/update-ai-context-prompt.md`
- Промт пользователя:
  ```text
  Я хочу добавить шаблон скила, который потом будет переноситься в скилы
  репозитория и будет обновлять ai-context из корневого репозитория.
  ```
- Что сделано: добавлен канонический skill `aic-update-ai-context`, который
  определяет source-of-truth из baseline manifest и запускает штатные sync и
  verify scripts для текущего репозитория.
- Что сделано: skill сохраняет repo-local данные, не обновляет repository
  skills как часть другого workflow и не создает tasks/changelog только из-за
  инфраструктурной синхронизации.
- Что сделано: skill добавлен в skills manifest; существующий update prompt
  использует его как основную точку входа после установки.
- Проверки: оба manifest валидны, frontmatter обоих skills корректен, два
  skills устанавливаются и проходят verify, измененный baseline
  восстанавливается штатным sync, repo-local marker сохраняется,
  `verify-ai-context.py` и `git diff --check` проходят.
