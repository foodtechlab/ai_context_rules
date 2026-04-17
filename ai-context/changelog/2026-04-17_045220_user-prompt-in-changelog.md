# В changelog добавлена фиксация пользовательского промта

- Время: `2026-04-17 04:52:20 +0300`
- Файлы:
  - `ai-context/baseline/ai-rules/005_append-only-changelog.md`
  - `ai-context/baseline/ai-rules/010_user-prompt-in-changelog.md`
  - `ai-context/baseline/ai-rules/README.md`
  - `ai-context/baseline/guides/changelog.md`
  - `ai-context/baseline/guides/tasks.md`
  - `ai-context/baseline/templates/task-details.md`
- Промт пользователя:
  ```text
  я хочу что бы ты добавил новое правило в baseline:

  каждый раз когда записываюются изменения в changelog нужно так же фиксировать промт, который пользователь отправлял, что бы можно было потом посмотреть лучшие практики
  ```
- Что сделано: добавлено новое baseline-правило, которое требует сохранять пользовательский промт в каждом новом changelog-файле.
- Что сделано: guides по changelog и task-flow обновлены так, чтобы это требование было частью рабочего процесса, а не только отдельного правила.
- Что сделано: шаблон task details обновлен, чтобы напоминать про обязательную фиксацию пользовательского промта при создании changelog.
