# Дизайн-система разложена по отдельным файлам сущностей

- Время: `2026-11-04 21:19:40 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/design-system-studio/`
  - `ai-context/baseline/skills/aic-design-system-studio/`
  - `ai-context/baseline/skills/aic-reconstruct-design-system/`
  - `ai-context/baseline/templates/apps/design-system-studio/project/`
  - `examples/design-system-example/`
  - `maintainer-context/tasks/task-details/01-001.md`
- Промт пользователя:
  ```text
  у меня важный вопрос. ты случаем ничего не перепутал? я сейчас зашел в
  examples/design-system-example и не вижу файлов экранов или компонентов.

  значит логика нарушена.

  Я предполагал, что каждый компонент, каждый экран, лейаут и прочее будут
  лежать в отедльном файле. они уже не относятся на прямую к
  design-system-studio а являются отдельными файлами. сейчас я даже файлов не
  вижу.

  значит это ошибка

  тебе нужно ее исправить и жестко зашить это правило в baseline и скилах, что
  бы не было ошибок в репо которые уже будут это использовать
  ```
- Что сделано: монолитный `studio.json` заменён строгим project-owned форматом:
  `design-system.json` содержит только общие настройки, а каждая theme, token,
  component, layout, screen, flow и mockup хранится в собственном `<id>.json`.
- Что сделано: runtime загружает отдельные файлы в память, проверяет имя файла,
  id, classification и cross-references, а при сохранении снова раскладывает
  данные по отдельным файлам. Legacy `studio.json` намеренно отклоняется.
- Что сделано: добавлена проверяемая команда безопасного разбиения старого
  монолита; starter template и admin example конвертированы без потери данных.
- Что сделано: React-компоненты admin example также разнесены по отдельным
  `.tsx`; `index.tsx` оставлены только как barrel re-export.
- Что сделано: обязательное правило «одна сущность — один файл» закреплено в
  документации baseline, schema, starter template, skill запуска Studio, skill
  восстановления дизайн-системы и blueprint создаваемых задач.
- Что сделано: готовый AI prompt теперь указывает прямо на definition-файл
  выбранного компонента, а сводный JSON-редактор явно обозначен как временное
  in-memory представление.
- Проверки: 8 unit-тестов, TypeScript, production build, validator admin
  example, TypeScript project components, runtime API smoke test и установка с
  verify полного набора AIC skills во временный Git-репозиторий пройдены.
