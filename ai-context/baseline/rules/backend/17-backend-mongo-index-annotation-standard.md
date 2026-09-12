# Стандарт объявления MongoDB-индексов через CompoundIndex

## Статус

Доступно как опциональный baseline-профиль. Становится обязательным только если
class-level способ объявления MongoDB-индексов принят локальными правилами.

## Цель

Хранить полный контракт индексов MongoDB в одном видимом месте — на root
`*Doc` — и не разбрасывать скрытые field-level индексы по полям документа и
вложенным классам.

## Область применения

Правило действует для всего `<backend-root>`, включая:

- root и embedded MongoDB-документы;
- production-код и тестовые документы;
- persistence contract tests;
- task details, примеры и техническую документацию;
- новые и уже существующие индексы, обнаруженные во время изменения feature.

## Жёсткое правило

Аннотация Spring Data MongoDB `@Indexed` строго запрещена:

```java
@Indexed
private String status;
```

Запрещены любые её варианты и параметры:

```java
@Indexed(name = "ix_status")
@Indexed(unique = true)
@Indexed(expireAfterSeconds = 0)
@Indexed(sparse = true)
@Indexed(background = true)
```

Все декларативные MongoDB-индексы должны размещаться на root `*Doc` только через:

- `@CompoundIndex` — если индекс один;
- `@CompoundIndexes` с вложенными `@CompoundIndex` — если индексов несколько.

Название `@CompoundIndex` является каноническим названием аннотации Spring Data.
Сокращения `@composeIndex`, `@ComposeIndex` или собственные аннотации-обёртки
использовать нельзя.

Правило действует и для индекса по одному полю. Количество полей не определяет
выбор аннотации:

```java
@Document
@CompoundIndex(name = "ix_host_status", def = "{'status': 1}")
public class ResourceDoc extends BaseDocument {
    private String status;
}
```

Если индексов несколько:

```java
@Document
@CompoundIndexes({
        @CompoundIndex(name = "ix_host_status", def = "{'status': 1}"),
        @CompoundIndex(name = "ix_host_group_status", def = "{'groupId': 1, 'status': 1}")
})
public class ResourceDoc extends BaseDocument {
}
```

## Другие field-level аннотации

Нельзя обходить запрет другими аннотациями поля, создающими MongoDB-индекс,
например `@TextIndexed`, `@GeoSpatialIndexed`, `@HashIndexed` или собственным
meta-annotation над `@Indexed`.

Если feature действительно требует текстовый, географический, hashed или другой
специальный индекс, сначала необходимо отдельное архитектурное решение и новое
явное правило. До этого момента автоматически объявлять такой индекс запрещено.

## TTL-индексы

`@Indexed(expireAfterSeconds = ...)` запрещён без исключений.

Используемая проектом версия `@CompoundIndex` не предоставляет параметр TTL, а
MongoDB предъявляет отдельные ограничения к TTL-индексам. Поэтому нельзя молча:

- оставлять `@Indexed` только потому, что индекс удаляет записи по времени;
- создавать TTL-индекс программно при startup;
- переносить его в Mongo shell, migration или init-script;
- маскировать field-level индекс собственной аннотацией.

Для данных с retention нужно отдельно спроектировать поддерживаемый механизм:
например bounded cleanup через repository/scheduler или новую согласованную
политику инфраструктурных индексов. Такое решение должно быть оформлено отдельной
задачей и не является исключением из текущего запрета.

## Программное создание индексов

Нельзя обходить единый декларативный контракт через:

- `MongoTemplate.indexOps(...).ensureIndex(...)`;
- `Index`, `TextIndexDefinition`, `GeospatialIndex` и аналоги;
- startup runner, listener или application event;
- migration, Mongo shell и инфраструктурный init-файл.

Если индексом управляет внешняя инфраструктура, такой подход сначала должен быть
разрешён отдельным project-specific правилом. По умолчанию единственная
разрешённая форма — `@CompoundIndex` на root `*Doc`.

## Исправление найденного нарушения

При обнаружении `@Indexed` необходимо:

1. Определить назначение, query pattern, имя, ключи и options индекса.
2. Проверить существующий MongoDB index contract и правило совместимости имён.
3. Для обычного индекса перенести декларацию на root `*Doc` как
   `@CompoundIndex`, даже если индексируется одно поле.
4. Удалить import `Indexed` и аннотацию с поля.
5. Для TTL или другого неподдерживаемого `@CompoundIndex` варианта не придумывать
   обход: зафиксировать отдельную задачу на retention/index design.
6. Обновить contract tests: они должны проверять параметры `@CompoundIndex` и
   полное отсутствие `@Indexed`.
7. Просканировать весь `<mongo-module>`, а не только изменённый документ.

## Миграции

Само правило не разрешает автоматически переименовывать или пересоздавать уже
существующие индексы. Совместимость имён, ключей и options определяется
`12-backend-mongo-index-compatibility.md`.

Запрещено добавлять migration или startup-код только ради сокрытия нарушения.
Если проект находится в дорелизной разработке и отдельное правило запрещает
миграции, код сразу должен описывать согласованную итоговую модель.

## Автоматическая проверка

Минимальный обязательный поиск:

```bash
rg -n '@Indexed|@TextIndexed|@GeoSpatialIndexed|@HashIndexed' \
  <backend-root> \
  --glob '!**/target/**'
```

В production-коде совпадений быть не должно. Упоминания допустимы только внутри
архитектурного теста, который проверяет запрет, и в документации запрещённого
примера.

Архитектурный тест MongoDB-модуля должен:

- проверить root `*Doc` и embedded documents;
- завершаться ошибкой при наличии `@Indexed` на любом поле;
- завершаться ошибкой при наличии других field-level index annotations;
- проверять `@CompoundIndex`/`@CompoundIndexes` на root `*Doc`;
- не считать индекс по одному полю основанием для использования `@Indexed`.

## Что запрещено

- Использовать `@Indexed` «для простого индекса по одному полю».
- Использовать `@Indexed` для TTL.
- Оставлять старый `@Indexed`, потому что он уже существовал до изменения.
- Размещать индексную аннотацию на embedded-поле.
- Создавать собственный alias для `@Indexed`.
- Генерировать индекс программно или через startup-код вместо `@CompoundIndex`.
- Добавлять локальное исключение в task details или комментарии к классу.

## Чеклист ревью

- Во всём backend отсутствует `@Indexed`.
- Отсутствуют другие field-level index annotations.
- Все разрешённые MongoDB-индексы видны на root `*Doc`.
- Для одного индекса используется `@CompoundIndex`.
- Для набора индексов используется `@CompoundIndexes`.
- Сохранены совместимые имена, keys и options индексов.
- Тесты проверяют отсутствие field-level индексов.
- Выполнены MongoDB-тесты и `git diff --check`.

## Связанные правила

- `04-backend-mongo-persistence.md`
- `09-backend-layer-checklists.md`
- `11-backend-mongo-document-annotation-standard.md`
- `12-backend-mongo-index-compatibility.md`
- `16-backend-unique-index-ban.md`
