# Reconstruction task blueprint

## Порядок задач

Создавать задачи в следующем порядке и явно указывать dependencies:

1. Bootstrap project-owned design-system, только если её ещё нет.
2. Зафиксировать base design system и platform inheritance.
3. Восстановить base token sets: palettes, font foundations, spacing и другие
   найденные шкалы — отдельная задача на связный set.
4. Восстановить semantic tokens и theme overrides — отдельная задача на
   semantic domain или самостоятельную theme.
5. Восстановить каждый component отдельной задачей, начиная с dependencies.
6. Восстановить каждый reusable layout/template отдельной задачей.
7. Восстановить каждый screen и все его состояния отдельной задачей.
8. Восстановить каждый user flow отдельной задачей.
9. Восстановить каждый воспроизводимый mockup/fixture set отдельной задачей.
10. Выполнить интеграционную validation/cross-reference задачу.

Не создавать implementation-задачу для абстракции, которую source evidence не
подтверждает. Неясную границу описывать как open question в ближайшей задаче
или как отдельную research-задачу, если без ответа заблокировано несколько
элементов.

## Гранулярность

- Component: одна задача на один stable component id, включая его варианты и
  применимые состояния.
- Layout: одна задача на один повторно используемый structural pattern.
- Screen: одна задача на один screen identity, включая loading/empty/error и
  responsive variants; не создавать отдельную задачу на каждое состояние.
- Flow: одна задача на одну пользовательскую цель и её ветвления.
- Mockup: одна задача на один flow fixture family, если fixtures разделяют
  одинаковую цель и переходы.
- Tokens: одна задача на логически связанную шкалу или semantic domain, а не на
  каждый scalar и не на все tokens сразу.

## Обязательная структура detail

Начать с marker, затем использовать template `task-details.md` и добавить
следующие разделы, если их ещё нет:

```markdown
<!-- aic-design-reconstruction: source=<path>; kind=<kind>; id=<id> -->

# Задача [<code>]

## Короткое описание

## Цель

## Source evidence

- `<repo-relative-path>:<line or symbol>` — что именно подтверждает.

## Target design-system contract

- Section/kind и stable id.
- Target files/directories.
- Точный definition-файл `<id>.json`; одна задача элемента не должна помещать
  определение в общий файл или массив.
- Platform-specific ограничения.

## Зависимости

- `[<code>] <task>` или `Нет`.

## Что сделать

## Варианты, состояния и адаптация

## Открытые вопросы

## Критерии готовности

## Обязательные дополнительные условия

## Связанные правила

## Связанные файлы
```

## Требования к содержанию

- Source evidence должна указывать конкретные файлы и symbols; directory-only
  evidence недостаточно для element task.
- Target contract должен использовать существующую schema v1 и не придумывать
  unsupported fields.
- Для component использовать
  `components/{atoms,molecules,organisms}/<component-id>.json`, для layout —
  `layouts/<layout-id>.json`, для screen — `screens/<screen-id>.json`, для flow
  — `flows/<flow-id>.json`, для mockup — `mockups/<mockup-id>.json`.
- Definition каждого элемента и его implementation source должны быть
  отдельными файлами. Barrel-файлы разрешены только для реэкспорта.
- Для component перечислять dependencies, props/content, variants, states,
  actions, tokens, responsive и accessibility behavior.
- Для screen перечислять layout, blocks/components, data/actions, entry/return,
  viewports и все подтверждённые состояния.
- Для flow перечислять entry, nodes, transitions, conditions, happy/alternate
  paths, recovery и completion.
- Для mockup перечислять fixtures, implemented/simulated interactions, themes,
  viewports и reset behavior.
- Критерии должны проверять schema references, preview и соответствие source
  evidence, а не только факт создания файла.

## Дедупликация

Уникальный ключ — tuple `source + kind + id` из marker. Перед выделением нового
кода искать этот marker во всех active details и archive.

Если одинаковый source element реализован на нескольких платформах, использовать
один общий id только при подтверждённом product parity; иначе создать отдельные
platform variants/tasks и связать их общей open question или adapter note.
