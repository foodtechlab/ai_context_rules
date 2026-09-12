# Persistence-правила для `<mongo-module>`

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Зафиксировать переносимый паттерн Mongo persistence-слоя, чтобы AI не тянул
Mongo-код в domain/API модули и не обходил domain-порты прямыми доступами к
базе.

## Область применения

Все изменения внутри `<mongo-module>`, включая новые Mongo документы,
mapper-ы, query-объекты, repository implementation и id generator-ы.

## Правило

### Mongo mapper

- Mongo mapper именуется `<Feature>MongoMapper`, живёт в feature-пакете
  `mapper` и является MapStruct interface.
- Каноническая форма для совместимых entity/document моделей:

```java
@Mapper(componentModel = "spring", uses = {ObjectIdMapper.class})
public interface FeatureMongoMapper
        extends ProjectDataMapper<FeatureEntity, FeatureDoc> {
}
```

- Унаследованные `map(Entity)` и `inverseMap(Doc)` не переобъявляются через
  `@Override`, если на метод не требуется реальная MapStruct-настройка.
- `injectionStrategy` не задаётся без конкретной причины: используется
  существующая конфигурация MapStruct/Spring целевого проекта.
- `@Mapping`, custom/default methods и дополнительные `uses` добавляются только
  для фактического несовпадения типов или имён полей. Mapper не содержит
  business logic.
- Ручной `<Feature>MongoMapperImpl` запрещён: implementation генерирует
  MapStruct.

- Для каждой persistence-фичи использовать принятый в проекте разрез, например
  `documents`, `mapper`, `queries`, `port`.
- Реализации domain-портов должны жить в `port` и называться по паттерну
  `Mongo*Repository`, `Mongo*IdGenerator` и т.п.
- Mongo documents должны называться с суффиксом `Doc` по проектному
  naming-паттерну: `ResourceDoc`, `AccountDoc`, `FeatureSettingDoc`,
  `NotificationRouteDoc`.
- Mongo document для обычной entity должен наследоваться от `BaseDocument`.
  Для soft-delete entity использовать `BaseDeleteDocument`; для entity с
  external links - `BaseExternalDocument`; для soft-delete + external links -
  `BaseExternalDeleteDocument`.
- Embedded document без собственного id/lifecycle может не наследоваться от
  `BaseDocument`; пример такого embedded document - `NotificationRouteDoc`.
- Не нужно автоматически дублировать обычный domain data/value object как
  `*Doc`. Если вложенный класс не является `*Entity`, не имеет собственного id,
  lifecycle и инфраструктурных зависимостей, его можно хранить в root `*Doc`
  напрямую. Дублировать отдельный embedded `*Doc` нужно только когда требуется
  отдельная persistence representation.
- Root/nested `*Entity` хранить внутри Mongo `*Doc` напрямую нельзя: для entity
  нужна отдельная persistence representation и mapping boundary.
- Mongo repository для обычной entity должен наследоваться от
  `AbstractMongoRepository<String, <Entity>, <Doc>, <Filters>>` и implements
  domain repository. Для soft-delete entity использовать
  `AbstractMongoSafeDeleteRepository<String, <Entity>, <Doc>, <Filters>>`.
- Mongo id generator должен наследоваться от `ObjectIdGenerator` и implements
  domain `*IdGenerator<ObjectId>`. Для singleton-документа допускается
  override `generate()` и `parse(String)` с детерминированным `ObjectId`.
- Query-класс должен наследоваться от `ProjectBaseQuery`, если repository
  использует стандартный search/filter flow.
- Mongo документы являются persistence-моделью и не должны использоваться как
  domain entity за пределами `<mongo-module>`.
- Перевод между root `*Doc` и `*Entity` выполняется через mapper-слой. Простые
  вложенные domain value objects внутри root `*Doc` можно маппить напрямую,
  если они не являются entity и не зависят от инфраструктуры.
- Mapper должен жить в `mapper` и называться `<Feature>MongoMapper`.
- Query-логика и Mongo criteria должны жить в `queries` или в repository
  implementation, а не в controller, config или domain use case-ах.
- Остальные модули должны работать с persistence только через domain-порты, а
  не через прямой импорт Mongo implementation-классов.
- Persistence любой интеграционной фичи следует тому же паттерну и живёт в
  `<mongo-module>`, а её domain-контракты — в `<domain-module>`.
- Provider-specific collections, identifiers и raw payload добавлять только
  под фактические требования продукта, а не по схеме reference-проекта.

## Правило Mongo indexes и parallel arrays

MongoDB не поддерживает compound multikey index, если индекс одновременно
затрагивает два и более разных array-поля одного документа. Такой индекс падает
на записи/обновлении документа ошибкой вида:

```text
cannot index parallel arrays [firstArray] [secondArray]
```

Поэтому перед добавлением `@CompoundIndex` в `*Doc` обязательно проверить, не
попадают ли в `def` несколько разных array-root путей. Например, индекс вида:

```text
{'enabled': 1, 'typeSettings.type': 1, 'deliveryTargets.valid': 1}
```

запрещен, если и `typeSettings`, и `deliveryTargets` являются массивами. Это
нужно заменять на несколько отдельных индексов, каждый из которых содержит
только один array-root плюс scalar-поля:

```text
{'enabled': 1, 'typeSettings.type': 1, 'typeSettings.enabled': 1}
{'enabled': 1, 'deliveryTargets.valid': 1}
```

Если запрос действительно требует эффективной фильтрации по нескольким массивам
одновременно, нельзя решать это одним compound index-ом. Нужно выбрать один из
вариантов:

- разделить supporting indexes по массивам и принять фильтрацию оставшихся
  условий после выборки;
- изменить persistence-модель так, чтобы поля для частого запроса лежали в
  одном embedded-массиве;
- вынести read model/dispatch collection под конкретный batch-сценарий;
- явно описать trade-off в задаче/changelog.

## Правило массового переноса ссылок

Если в проекте есть бизнес-сценарий переноса ownership между
сущностями, список затрагиваемых Mongo-коллекций и полей должен быть
явно зафиксирован в локальном gateway и покрыт тестами. Схему или набор
коллекций reference-проекта нельзя копировать без такого бизнес-требования.

## Что запрещено

- импортировать Mongo `documents` в `<domain-module>` или `<admin-api-module>`;
- описывать Mongo criteria и Query-код в use case-ах или controller-ах;
- обращаться к MongoTemplate напрямую из transport или runtime-кода, минуя
  domain-порты;
- дублировать persistence-модель как “временную entity” в неподходящем модуле.
- создавать `@CompoundIndex`, который одновременно индексирует два и более
  разных array-root поля одного документа, например `typeSettings.*` вместе с
  `deliveryTargets.*`.

## Чеклист применения

- проверить, существует ли нужный domain port; если нет, сначала определить его
  в domain-слое;
- создать Mongo document, mapper и repository implementation внутри нужной
  feature-папки;
- проверить имя mapper-а `<Feature>MongoMapper`, наследование от
  `ProjectDataMapper<Entity, Doc>` и каноническую `@Mapper` annotation;
- если entity/doc совместимы, проверить пустое тело mapper interface: без
  повторных `@Override map/inverseMap`, `injectionStrategy`, custom methods и
  ручного `*MapperImpl`;
- проверить, что root document-classes имеют суффикс `Doc`, а domain
  entity-classes имеют суффикс `Entity`;
- проверить, что в Mongo `*Doc` не сохранены domain `*Entity` напрямую;
- не создавать embedded `*Doc` для простого domain value object без причины;
- убедиться, что query-логика локализована внутри `<mongo-module>`;
- проверить, что внешний слой зависит от интерфейса порта, а не от Mongo-класса;
- убедиться, что diff не выносит Mongo details за пределы persistence-модуля.
- для каждого нового/измененного `@CompoundIndex` проверить, что в `def` не
  смешаны несколько array-root путей одного документа. Если есть несколько
  массивов, индекс разделить на несколько безопасных supporting indexes или
  пересмотреть модель данных.
- если новая или изменённая коллекция содержит переносимую внешнюю ссылку,
  проверить принятый в проекте reference-transfer механизм либо явно описать,
  почему перенос не нужен.
