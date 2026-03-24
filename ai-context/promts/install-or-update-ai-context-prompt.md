# Промт: Установить или обновить `ai-context` из source-of-truth репозитория

## Назначение

Используй этот промт, когда пользователь просит:

- установить `ai-context` в новый рабочий репозиторий;
- обновить `ai-context` из репозитория
  `https://github.com/foodtechlab/ai_context_rules`;
- синхронизировать baseline-правила без потери локального рабочего состояния.

## Готовый промт

```text
Установи или обнови `ai-context` в текущем рабочем репозитории из `https://github.com/foodtechlab/ai_context_rules`.

Обязательные правила:

1. Сначала используй актуальную baseline-версию из основной ветки source-of-truth репозитория:
- `main`, если она существует;
- `master`, если репозиторий использует ее как основную ветку.
2. Сначала прочитай `ai-context/update-policy.md` в source-of-truth репозитории.
3. Раздели файлы на две группы:
- baseline, которые можно копировать или обновлять;
- project-local, которые нельзя затирать.

4. При первой установке:
- скопируй baseline;
- создай недостающие project-local файлы и директории;
- не придумывай project-specific правила в `ai-context/rules` без анализа кода проекта.

5. При обновлении:
- обнови baseline-файлы;
- не перезаписывай:
  - `ai-context/content/**/*`
  - `ai-context/tasks/task-list.md`
  - `ai-context/tasks/task-draft.txt`
  - `ai-context/tasks/task-details/**/*`, кроме `ai-context/tasks/task-details/_template/**/*`
  - `ai-context/changelog/*.md`, кроме `README.md`
  - `ai-context/rules/*.md`, кроме `README.md` и `_template.md`
- если baseline-файл в проекте был осознанно доработан локально, делай merge, а не слепую замену.

6. После синхронизации:
- перечисли, какие baseline-файлы были установлены или обновлены;
- перечисли, какие project-local файлы были сохранены без перезаписи;
- отдельно укажи места, где потребовался merge или ручной review.

Не делай:
- перезапись живого backlog в `task-list.md`;
- удаление `content/` и дневных файлов `changelog`;
- уничтожение project-specific архитектурных правил в `ai-context/rules`.
```
