# Repository skills из `ai-context`

## Правило

Skills из `ai-context` устанавливаются только в текущий репозиторий:

- source-of-truth: `ai-context/baseline/skills/`;
- manifest: `ai-context/baseline/skills/manifest.json`;
- repo-local staging импорта: `ai-context/skills/imports/`;
- рабочая установка: `.agents/skills/`.

Префикс `aic-` зарезервирован для технических имен управляемых skills, а
`AIC: ` — для их UI-названий.

## Поведение агента

По командам `установи скилы` и `установи скиллы из ai-context` агент обязан
выполнить `baseline/promts/install-ai-context-skills-prompt.md`.

Повторная установка должна обновлять управляемые skills из source-of-truth.
Нельзя заменять сторонние skills, не перечисленные в manifest и не записанные
как ранее установленные AIC skills.
