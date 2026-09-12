# Mongo index compatibility

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Не допускать падений Spring Data auto-index creation из-за несовместимых имен
или options Mongo indexes.

MongoDB считает конфликтом ситуацию, когда index с теми же keys/options уже
существует, но имеет другое имя. Spring Data auto-index creation не
переименовывает такой index, а приложение падает с `IndexOptionsConflict`.

Имя Mongo index-а - это часть runtime-контракта, а не косметика. Для existing
collections агент должен сначала сохранять совместимость с тем, что уже есть в
Mongo.

## Область применения

Все изменения внутри `<mongo-module>`, которые добавляют или
меняют:

- `@CompoundIndex`;
- `@CompoundIndexes`;
- найденные запрещённые `@Indexed`, которые требуется заменить по правилу
  `17-backend-mongo-index-annotation-standard.md`;
- Mongo `*Doc`;
- unit-тесты, task details или docs, где зафиксированы имена indexes;
- migration/ops-инструкции для Mongo indexes.

Запрет explicit unique-индексов и особый порядок их удаления определяет
`16-backend-unique-index-ban.md`. Для `unique = true` новое правило имеет
приоритет над общими требованиями совместимости из этого файла.

Форма объявления индексов определяется
`17-backend-mongo-index-annotation-standard.md`: `@Indexed` запрещён, включая
TTL-индексы, а допустимые декларации размещаются на root `*Doc` через
`@CompoundIndex`/`@CompoundIndexes`.

## Правило

- Нельзя менять имя существующего Mongo index-а без явной миграции.
- Если в БД уже есть index с нужными keys/options, annotation должна
  использовать то же имя index-а.
- Если нужно изменить имя, keys, sort direction, `partialFilter`,
  `sparse`, `expireAfterSeconds` или другие options, нужно отдельно описать
  migration: drop старого index-а и создание нового.
- Удаление запрещенного `unique = true` выполняется без migration, migration
  plan, startup-runner и другого legacy-кода согласно
  `16-backend-unique-index-ban.md`.
- Если compatibility-информация из Mongo недоступна, нельзя угадывать новое
  имя index-а для existing collection. Нужно использовать уже зафиксированное
  имя из текущего кода/docs или явно отметить blocker для проверки indexes в
  окружении.
- Для новых documents тест обязан фиксировать:
  - collection contract по правилу
    `11-backend-mongo-document-annotation-standard.md`;
  - index name;
  - index keys;
  - отсутствие запрещенного `unique = true`;
  - важные index options;
  - полное отсутствие `@Indexed` на полях.

## Проверка агентом

1. Найти все новые/измененные Mongo documents.
2. При изменении Mongo indexes дополнительно просканировать весь
   `<mongo-module>`, чтобы не оставить соседние нарушения index contract-а.
3. Для каждого `@CompoundIndex` проверить, нет ли уже существующего index-а с
   теми же keys/options и другим именем; каждое найденное `@Indexed` считать
   отдельным нарушением правила `17`.
4. Если найден конфликт:
   - безопасный fix: заменить annotation `name` на существующее имя index-а;
   - если нужно именно новое имя: не менять молча, а добавить migration plan.
5. Обновить unit-тесты index contract-а.
6. Обновить task details/docs, если там зафиксировано имя index-а.
7. Запустить релевантные mongo-тесты и `git diff --check`.

## Команды для локальной проверки

Найти index annotations:

```bash
rg -n '@CompoundIndex|@CompoundIndexes|@Indexed' <backend-root>/<mongo-module>/src/main/java
```

Найти тесты/documentation, где зафиксированы имена indexes:

```bash
rg -n '_idx|_unique_idx|CompoundIndex' . ai-context/tasks docs
```

Если доступен локальный Mongo, проверить реальные indexes collection перед
переименованием или изменением options:

```javascript
db.<collectionName>.getIndexes()
```

## Пример ошибки

```text
IndexOptionsConflict: Index already exists with a different name
```

Пример полного runtime-сообщения:

```text
Cannot create index for '' in collection 'measurements'
with keys 'Document{{userId=1, measurementDate=1}}'
and options 'Document{{name=sample_measurement_user_date_idx, sparse=true}}'.
Index already exists with a different name:
sample_measurement_user_date_sparse_idx
```

## Правильное исправление

Если Mongo уже содержит:

```text
sample_measurement_user_date_sparse_idx
{ userId: 1, measurementDate: 1 }, sparse=true
```

то annotation должна использовать существующее имя:

```java
@CompoundIndex(
        name = "sample_measurement_user_date_sparse_idx",
        def = "{'userId': 1, 'measurementDate': 1}",
        sparse = true
)
```

Нельзя заменить это имя на новое без migration plan:

```java
@CompoundIndex(
        name = "sample_measurement_user_date_idx", // запрещено без миграции
        def = "{'userId': 1, 'measurementDate': 1}",
        sparse = true
)
```

## Что запрещено

- Переименовывать index в annotation только ради "более красивого" имени.
- Менять keys/options existing index-а без migration/changelog, кроме удаления
  запрещенного `unique = true` по правилу
  `16-backend-unique-index-ban.md`.
- Исправлять runtime `IndexOptionsConflict` удалением index-а из Mongo без
  отражения изменения в code/docs/tests.
- Оставлять task details или docs со старым именем index-а после исправления
  annotation.
- Создавать `@Indexed` на любом поле root или embedded MongoDB-документа,
  независимо от обоснования, типа и параметров индекса.

## Чеклист применения

- Определить collection и все index annotations измененного `*Doc`.
- Сверить имена, keys и options с existing indexes collection.
- При совпадающих keys/options использовать существующее имя index-а.
- При несовместимых изменениях описать migration plan.
- Обновить index contract tests.
- Обновить task details/docs, где упоминается index.
- Запустить релевантные `<mongo-module>` tests и `git diff --check`.

## Связанные правила

- `04-backend-mongo-persistence.md`
- `09-backend-layer-checklists.md`
- `11-backend-mongo-document-annotation-standard.md`
- `16-backend-unique-index-ban.md`
- `17-backend-mongo-index-annotation-standard.md`
