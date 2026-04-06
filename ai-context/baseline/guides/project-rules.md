# Project Rules Guide

Живые project-specific правила всегда хранятся в `ai-context/workspace/rules/`.
Этот baseline-файл описывает только то, как их организовывать.

## Зачем нужен отдельный workspace-слой

Не все правила должны жить в общих `baseline/ai-rules`.
Все, что относится к архитектуре конкретного репозитория, должно жить в
`workspace/rules/` и иметь локальный приоритет.

## Что складывать в `workspace/rules/`

- правила структуры слоев и пакетов;
- стандарты API;
- правила отчетных endpoint-ов;
- naming, wiring и boundary-правила;
- device/domain/entity conventions;
- любые долгоживущие проектные решения, которые должны применяться повторно.

## Принцип

- если правило привязано к конкретной архитектуре проекта, оно должно жить в
  `workspace/rules/`;
- если правило межпроектное и повторяется везде, оно должно жить в
  `baseline/ai-rules/`;
- задачи из `workspace/tasks/task-details/*.md` должны ссылаться на применимые
  правила из `workspace/rules/`.

## Рекомендуемый каркас

В `baseline/examples/rules/` лежат только examples структуры:

- `backend/`
- `frontend-react-js-ts/`
- `flutter/`

В рабочем проекте такие же контуры можно использовать внутри `workspace/rules/`,
но baseline не должен наполнять их project-specific контентом.

## Именование

Рекомендуется хранить одно устойчивое правило в одном файле.

Примеры имен:

- `01-domain-layer-structure-rules.md`
- `03-api-rules.md`
- `04-dashboard-report-rules.md`

Для нового project-specific правила можно использовать шаблон
`ai-context/baseline/templates/project-rule.md`.
