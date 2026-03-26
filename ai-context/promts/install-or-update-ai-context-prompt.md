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
- создай `ai-context/parameters/repository/repository-parameters.yaml` на основе шаблона, если его еще нет;
- если в проекте выбран режим `project-manager`, скопируй из root `epics/` source-of-truth только документационные файлы `epics/README.md` и `epics/_example/**/*`;
- если в проекте выбран режим `project-manager`, создай project-local файл `epics/epic-list.md`, если его еще нет;
- если режим `project-manager` не выбран, не копируй `epics/` из source-of-truth в рабочий проект;
- не придумывай project-specific правила в `ai-context/rules` без анализа кода проекта.

5. При обновлении:
- обнови baseline-файлы;
- не перезаписывай:
  - `ai-context/content/**/*`
  - `ai-context/parameters/repository/repository-parameters.yaml`
  - `ai-context/parameters/local-machine/**/*`, кроме `README.md`, `.gitignore` и `local-machine.example.yaml`
  - `ai-context/tasks/task-list.md`
  - `ai-context/tasks/task-draft.txt`
  - `ai-context/tasks/task-details/**/*`
  - `ai-context/tasks/task-details/*.md`, кроме `ai-context/tasks/task-details/_template.md`
  - `ai-context/changelog/*.md`, кроме `README.md`
  - `ai-context/rules/*.md`, кроме `README.md` и `_template.md`
  - `epics/epic-list.md` и рабочие директории эпиков, если репозиторий работает в режиме `project-manager`
- в режиме `project-manager` внутри `epics/` обновляй только документационные baseline-файлы `README.md` и `_example/**/*`;
- если baseline-файл в проекте был осознанно доработан локально, делай merge, а не слепую замену.

6. После синхронизации:
- перечисли, какие baseline-файлы были установлены или обновлены;
- перечисли, какие project-local файлы были сохранены без перезаписи;
- отдельно укажи места, где потребовался merge или ручной review.

Не делай:
- перезапись живого backlog в `task-list.md`;
- перезапись repository-level параметров конкретного проекта;
- копирование `epics/` в проект, если режим `project-manager` не выбран;
- коммит или перезапись local-machine секретов;
- удаление `content/` и дневных файлов `changelog`;
- уничтожение project-specific архитектурных правил в `ai-context/rules`.
```
