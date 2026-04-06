# Epics Guide

В режиме `project-manager` backlog команды живет в
`ai-context/epics/`.

`ai-context/tasks/` при этом не заменяет `epics/`: в `tasks/` ведутся только
задачи, которые должен выполнить сам AI-агент.

## Что дает baseline

В `ai-context/baseline/examples/epics/` лежит только документация и example
структуры. Это не живой backlog проекта.

## Рекомендуемая структура

```text
ai-context/epics/
  epic-list.md
  <код>/
    <код>-epic.md
    <код>.md
    context/
```

Где:

- `epic-list.md` - короткий список эпиков;
- `<код>/<код>-epic.md` - основная постановка эпика;
- `<код>/<код>.md` - декомпозиция на задачи для команды;
- `<код>/context/` - supporting-материалы.

## Правила

- одна директория = один эпик;
- код эпика должен быть стабильным и читаемым, например `EP-001`;
- `baseline/examples/epics/_example/` нельзя считать рабочими эпиками проекта;
- при baseline-sync можно создавать `epics/epic-list.md`, только если его еще
  нет;
- существующие данные в `epics/` нельзя перезаписывать.
