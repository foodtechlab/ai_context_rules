# Промт: Обновить данные `ai-context` из source-of-truth репозитория

## Назначение

Используй этот промт, когда пользователь просит:

- обновить данные `ai-context`;
- подтянуть актуальные правила `ai-context`;
- синхронизировать локальный `ai-context` с
  `https://github.com/foodtechlab/ai_context_rules`.

## Готовый промт

```text
Обнови данные `ai-context` в текущем рабочем репозитории из `https://github.com/foodtechlab/ai_context_rules`.

Обязательные правила:

1. Используй актуальную baseline-версию из основной ветки source-of-truth репозитория:
- `main`, если она существует;
- `master`, если репозиторий использует ее как основную ветку.

2. Сначала прочитай `ai-context/update-policy.md` в source-of-truth репозитории.

3. Обнови только baseline-часть `ai-context`.

4. Не перезаписывай project-local данные:
- `ai-context/content/**/*`
- `ai-context/parameters/repository/repository-parameters.yaml`
- `ai-context/parameters/local-machine/**/*`, кроме `README.md`, `.gitignore` и `local-machine.example.yaml`
- `ai-context/tasks/task-list.md`
- `ai-context/tasks/task-draft.txt`
- `ai-context/tasks/task-details/**/*`, кроме `ai-context/tasks/task-details/_template/**/*`
- `ai-context/changelog/*.md`, кроме `README.md`
- `ai-context/rules/*.md`, кроме `README.md` и `_template.md`
- `epics/epic-list.md` и рабочие директории эпиков, если репозиторий работает в режиме `project-manager`

5. Если репозиторий работает в режиме `project-manager`, внутри `epics/` обновляй только документационные baseline-файлы `README.md` и `_example/**/*`.

6. Если baseline-файл в проекте уже был осознанно адаптирован локально, делай merge по смыслу, а не слепую замену.

7. После обновления:
- перечисли, какие baseline-файлы обновлены;
- перечисли, какие project-local области сохранены без перезаписи;
- отдельно укажи, были ли конфликты или места для ручного review.

Не делай:
- перезапись живого backlog;
- перезапись repository-level параметров проекта;
- копирование `epics/` в проект, если режим `project-manager` не выбран;
- коммит или удаление local-machine секретов;
- удаление локального changelog;
- уничтожение project-specific правил репозитория.
```
