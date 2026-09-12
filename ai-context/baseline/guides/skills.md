# Repository Skills Guide

`ai-context` управляет skills текущего репозитория.

## Структура

```text
ai-context/
  baseline/
    skills/
      manifest.json
      aic-<skill-name>/
        SKILL.md
        agents/openai.yaml
  skills/
    imports/
      <source-or-repository>/
        <candidate-skill>/
.agents/
  skills/
    .aic-installed.json
    aic-<skill-name>/
```

- `baseline/skills/` — канонический versioned набор source-of-truth.
- `skills/imports/` — repo-local staging для skills из других репозиториев.
- `.agents/skills/` — рабочая директория, которую обнаруживает AI-агент в
  текущем репозитории.
- `.aic-installed.json` — состояние только тех skills, которыми управляет
  `ai-context`.

Установленные `aic-*` skills и `.aic-installed.json` следует хранить в git
целевого репозитория вместе с остальным repository-level AI-контекстом.

## Naming и manifest

- Техническое имя skill и его директория начинаются с `aic-`.
- UI-имя в `agents/openai.yaml` начинается с `AIC: `.
- `aic-` зарезервирован за skills из `ai-context`.
- Каждый устанавливаемый skill явно перечисляется в
  `baseline/skills/manifest.json`.
- Skill, которого нет в manifest, не устанавливается из staging
  автоматически.

Manifest хранится в JSON, чтобы baseline-скрипты могли валидировать его без
сторонних Python-зависимостей.

## Установка и обновление

Команды `установи скилы` и `установи скиллы из ai-context` запускают workflow
из `baseline/promts/install-ai-context-skills-prompt.md`.

Установщик по умолчанию получает свежий manifest и содержимое skills из
source-of-truth репозитория, указанного в `baseline/manifest.json`, и ставит их
в `.agents/skills/` текущего репозитория. Повторный запуск:

- обновляет изменившиеся управляемые skills;
- оставляет неизменившиеся skills без перезаписи;
- удаляет только устаревшие skills, которые были записаны в AIC state-файл;
- не изменяет сторонние skills, не управляемые `ai-context`.

Локальные изменения внутри установленного `aic-*` skill будут заменены при
обновлении. Если изменение нужно сохранить, сначала опубликовать его в
source-of-truth.

## Импорт skill из другого репозитория

1. Скопировать исходный skill в
   `ai-context/skills/imports/<source-or-repository>/<candidate-skill>/`.
2. Проверить `SKILL.md`, `agents/openai.yaml`, scripts, references и assets.
3. Удалить project-specific имена, пути, доменные контракты, секреты и
   предположения о стеке. Заменить их обнаружением контекста целевого
   репозитория и проверкой применимости.
4. Переименовать директорию и `name` с префиксом `aic-`, а `display_name` — с
   префиксом `AIC: `.
5. Перенести готовый skill в `baseline/skills/aic-<skill-name>/` и добавить
   запись в `baseline/skills/manifest.json`.
6. Запустить установку и verify на временном целевом репозитории.

Staging не является источником установки. Это позволяет переносить skills из
любых репозиториев, не публикуя непроверенный project-specific контекст.
