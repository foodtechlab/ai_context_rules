# Local Machine Parameters Guide

Local-machine параметры живут только в
`ai-context/parameters/local-machine/`.

Такие параметры:

- зависят от конкретной локальной машины;
- могут содержать секреты;
- не должны коммититься в git.

## Что сюда можно класть

- логины и пароли для Bitrix;
- локальные токены и API keys;
- machine-specific доступы к Jira, Bitrix и другим системам;
- любые пользовательские секреты и credentials.

## Правило

- Реальные локальные параметры создаются пользователем только в `parameters/`.
- В baseline можно хранить только example-файл и шаблон `.gitignore`.
- Любой файл с реальными значениями должен оставаться неотслеживаемым.

## Рекомендуемый старт

Возьми за основу `ai-context/baseline/templates/local-machine.example.yaml` и
создай свой локальный файл, например:

- `local-machine.yaml`
- `bitrix.local.yaml`
- `integrations.local.yaml`
