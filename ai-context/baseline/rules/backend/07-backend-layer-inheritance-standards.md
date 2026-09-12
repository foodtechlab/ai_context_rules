# Inheritance-стандарты backend-слоев

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Зафиксировать inheritance-стандарты для `domain`, `mongo`, `api` и
`application`, чтобы новые feature-slice не создавались как простые POJO или
ручные repository-классы там, где уже есть общий backend-каркас проекта.

## Базовый ориентир

Имена base-классов ниже являются ролевыми примерами. Их нужно сопоставить с
реальными контрактами целевого проекта. Если таких abstractions нет, правило
не требует создавать их только ради совпадения с примером.

Ключевые примеры паттерна:

- `ResourceEntity extends BaseDeleteEntity<String>`
- `AuthSessionEntity extends BaseEntity<String>`
- `FeatureSettingEntity extends BaseEntity<String>`
- `NotificationRouteEntity` без `BaseEntity`, потому что это вложенная
  route-модель без id; в проекте такие value objects не должны получать
  суффикс `Entity`
- `ResourceDoc extends BaseDeleteDocument`
- `AuthSessionDoc extends BaseDocument`
- `FeatureSettingDoc extends BaseDocument`
- `MongoResourceRepository extends AbstractMongoSafeDeleteRepository<...>`
- `MongoFeatureSettingRepository extends AbstractMongoRepository<...>`
- `ResourceResponse extends BaseDeleteEntityResponse`
- `ResourceApiController extends AuthenticatedBaseController`
- `SpringWebMvcConfig implements WebMvcConfigurer`
- `SchedulingConfiguration implements SchedulingConfigurer`

## Domain

- Persisted domain root/entity с собственным `id`, `createdAt`, `updatedAt`
  должен наследоваться от `BaseEntity<String>`.
- Soft-delete entity должна наследоваться от `BaseDeleteEntity<String>`.
- Entity с external links без soft-delete должна наследоваться от
  `BaseExternalEntity<String>`.
- Entity с external links и soft-delete должна наследоваться от
  `BaseExternalDeleteEntity<String>`.
- Вложенная value object/embedded-модель без собственного id и lifecycle не
  должна наследоваться от `BaseEntity` и не должна получать суффикс `Entity`.
  Пример: `NotificationRoute`.
- Domain entity/root и настоящие nested entity-классы именуются с суффиксом
  `Entity`.
- Простые enum/status/type/value/data objects не получают суффикс `Entity`, если
  не являются entity: `Deadline`, `AssignedData`, `ResourceCreatedFromType`,
  `AuthSessionStatus`, `NotificationRoute`.
- Domain repository для обычной entity должен расширять
  `CRUDRepository<String, Entity, Filters>`.
- Domain repository для soft-delete entity должен расширять
  `SafeDeleteCRUDRepository<String, Entity, Filters>`.
- Domain `*IdGenerator<T>` должен расширять `BaseIdGenerator<T>`.
- Domain filters для обычного поиска должны расширять `SearchFilters`.
- Domain filters для soft-delete поиска должны расширять `DeleteFilter`.
- Use case должен наследоваться от `UseCase<Input, Output>` или от готового
  abstract/base use case, если сценарий совпадает:
  `AbstractFindByIdUseCase`, `AbstractForceFindByIdUseCase`,
  `AbstractFindWithFiltersUseCase`, `BaseDeleteUseCase`,
  `BaseCheckExistUseCase` и похожие.
- Вложенные `Input` классы должны implements `UseCase.InputValues`; zero-arg
  `execute()` не используется, вместо него нужен `VoidInputValues`.
- Вложенные `Output` классы должны implements `UseCase.OutputValues`, либо
  нужно использовать готовые output wrappers:
  `SingletonEntityOutputValues`, `SingletonOptionalEntityOutputValues`,
  `SearchResultEntityOutputValues`, `VoidOutputValues`, `SingleOutput`.
- Подробные правила выбора base use case, input/output wrappers и naming
  закреплены в `08-backend-usecase-standards.md`.
- Feature `*Config` не наследуется от base-класса. Он является фасадом, который
  создает и хранит use case-ы. Если проект использует Lombok fluent accessors,
  config может использовать `@Accessors(fluent = true)` и `@Getter`, чтобы доступ выглядел
  как `featureConfig.create()`, без ручных getter-методов. Полученный Use Case
  запускается через `UseCaseExecutor`.

## Mongo

- Mongo document для entity, которая наследуется от `BaseEntity`, должен
  наследоваться от `BaseDocument`.
- Mongo document для entity, которая наследуется от `BaseDeleteEntity`, должен
  наследоваться от `BaseDeleteDocument`.
- Mongo document для entity, которая наследуется от `BaseExternalEntity`, должен
  наследоваться от `BaseExternalDocument`.
- Mongo document для entity, которая наследуется от
  `BaseExternalDeleteEntity`, должен наследоваться от
  `BaseExternalDeleteDocument`.
- Embedded document без собственного id/lifecycle может не наследоваться от
  `BaseDocument`. Пример: `NotificationRouteDoc`.
- Для простого domain data/value object без id, lifecycle и инфраструктурных
  зависимостей отдельный embedded `*Doc` не обязателен: root Mongo `*Doc` может
  хранить такой объект напрямую. Это не относится к domain `*Entity`.
- Domain `*Entity` нельзя хранить внутри Mongo `*Doc` напрямую; entity всегда
  проходит через document/mapper boundary.
- Mongo repository для обычной entity должен наследоваться от
  `AbstractMongoRepository<String, Entity, Doc, Filters>` и implements domain
  repository.
- Mongo repository для soft-delete entity должен наследоваться от
  `AbstractMongoSafeDeleteRepository<String, Entity, Doc, Filters>` и implements
  domain repository.
- Mongo repository должен переопределять `getSearchQuery(Filters filters)` и
  возвращать feature query object.
- Mongo query object должен наследоваться от `ProjectBaseQuery`, если
  используется стандартный фильтр/поиск.
- Mongo mapper должен именоваться `<Feature>MongoMapper`, быть пустым MapStruct
  interface и расширять `ProjectDataMapper<Entity, Doc>`. Унаследованные
  `map`/`inverseMap` без специальных `@Mapping` не переобъявляются. Если id
  хранится как `ObjectId`, mapper использует `ObjectIdMapper` через
  `@Mapper(componentModel = "spring", uses = {ObjectIdMapper.class})`.
- Mongo id generator должен наследоваться от `ObjectIdGenerator` и implements
  domain `*IdGenerator<ObjectId>`.
- Для singleton-документов допускается наследоваться от `ObjectIdGenerator`,
  но override-ить `generate()` и `parse(String)` детерминированным `ObjectId`,
  как в `MongoFeatureSettingIdGenerator`.

## API

- Controller, которому нужен credential/current user/locale, должен
  наследоваться от `AuthenticatedBaseController`.
- `AuthenticatedBaseController` наследуется от `<SecurityContextAccessor>`.
- Public/health controller может быть обычным `@RestController`, если ему не
  нужен auth-context.
- Response DTO для persisted entity должен наследоваться от
  `BaseEntityResponse`.
- Response DTO для soft-delete entity должен наследоваться от
  `BaseDeleteEntityResponse`.
- Nested/simple request/response DTO без id/lifecycle не должны искусственно
  наследоваться от base response.
- Request DTO обычно не наследуются от base-классов.
- Transport mapper для entity response должен быть MapStruct interface и
  расширять `ProjectDataMapper<Entity, Response>`.
- Route constants должны жить в отдельном `routes` классе и использовать общий
  API base route проекта, например `BaseRoutes.API + BaseRoutes.V1` или
  текущий `ApiRoutes`.
- Controller возвращает API wrapper-ы проекта, например `<SuccessResponse>`
  и `<PageResponse>`, если feature использует проектный API pattern.

## Application

- `AppConfig` является `@Configuration` классом без inheritance.
- `AppConfig` объявляет `@Bean` для `UseCaseExecutor`, domain `*Config`,
  infrastructure facades, SDK/adapters и runtime dependencies.
- Конкретная реализация `UseCaseExecutor` выбирается из доступных в проекте;
  validating executor используется, если validation входит в его контракт.
- Domain `*Config` bean собирается в `AppConfig` из domain ports,
  id generators и соседних config/use case dependencies.
- Web MVC config должен implements `WebMvcConfigurer`, если настраивает
  converters, CORS, formatters или encoding.
- Scheduler config должен implements `SchedulingConfigurer`, если настраивает
  scheduler pool через `ScheduledTaskRegistrar`.
- Application layer не содержит domain state transition и не ходит в Mongo
  напрямую ради бизнес-операций.

## Применение в проекте

- Новые feature-slice следуют этим inheritance-стандартам, если соответствующие
  base-контракты уже приняты в целевом проекте.
- Legacy-код проекта, созданный до переноса стандарта, не нужно молча
  переписывать вместе с несвязанной задачей. Для исправления legacy-кода нужна
  отдельная задача-рефакторинг.
- Иллюстративный feature `featureSettings` выглядит по этому стандарту так:
  `FeatureSettingsEntity extends BaseEntity<String>`,
  `FeatureSettingsRepository extends CRUDRepository<...>`,
  `FeatureSettingsIdGenerator extends BaseIdGenerator<T>`,
  `FeatureSettingsDoc extends BaseDocument`,
  `MongoFeatureSettingsRepository extends AbstractMongoRepository<...>`,
  `MongoFeatureSettingsIdGenerator extends ObjectIdGenerator implements
  FeatureSettingsIdGenerator<ObjectId>`.

## Что запрещено

- Создавать persisted domain root/entity как POJO без `BaseEntity` или
  соответствующего common base-класса.
- Создавать Mongo document для root entity как POJO с ручным `@Id`, если есть
  подходящий `BaseDocument`/`BaseDeleteDocument`.
- Создавать repository port вручную с `save/findById`, если подходит
  `CRUDRepository` или `SafeDeleteCRUDRepository`.
- Создавать Mongo repository implementation вручную на `MongoTemplate`, если
  подходит `AbstractMongoRepository` или `AbstractMongoSafeDeleteRepository`.
- Создавать id generator port без `BaseIdGenerator<T>`.
- Возвращать response DTO для persisted entity без `BaseEntityResponse` или
  `BaseDeleteEntityResponse`, если endpoint использует проектный API
  pattern.

## Чеклист применения

- Определить, является ли class root entity, nested entity, value object,
  document, controller, response, repository или config.
- Для root entity выбрать base-класс: `BaseEntity`, `BaseDeleteEntity`,
  `BaseExternalEntity`, `BaseExternalDeleteEntity`.
- Для Mongo document выбрать соответствующий base document.
- Для repository port выбрать `CRUDRepository` или `SafeDeleteCRUDRepository`.
- Для Mongo repository выбрать `AbstractMongoRepository` или
  `AbstractMongoSafeDeleteRepository`.
- Для id generator проверить наследование от `BaseIdGenerator` в domain и
  `ObjectIdGenerator` в Mongo.
- Для API response проверить `BaseEntityResponse`/`BaseDeleteEntityResponse`.
- Для application config проверить, что это wiring, а не бизнес-логика.

## Связанные правила

- `01-backend-module-boundaries.md`
- `02-backend-feature-slice-and-config.md`
- `03-backend-api-transport.md`
- `04-backend-mongo-persistence.md`
- `05-backend-runtime-integrations-and-local-files.md`
- `08-backend-usecase-standards.md`
- `14-backend-entity-layout-and-documentation.md`
