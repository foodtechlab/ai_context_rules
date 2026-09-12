# Layer-by-layer backend checklist

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Этот документ фиксирует checklist-ы по backend-слоям, чтобы новые
feature-slice сразу создавались в ожидаемом стиле: naming, package layout,
annotations, inheritance, DTO, mapper, repository/query и application wiring.

## Базовый ориентир

Правила описывают переносимый профиль backend-архитектуры и применяются как
самостоятельный checklist при создании или проверке feature-slice.

## Важные уточнения

Имена классов, пакетов, routes и wrappers в checklist являются ролевыми
примерами. Перед применением их нужно сопоставить с архитектурой целевого
репозитория; отсутствующие base contracts нельзя создавать автоматически.

- Integration-specific domain не выносится в отдельный module без отдельного
  архитектурного решения. Такие feature живут внутри обычных backend-слоев:
  `<domain-module>`, `<mongo-module>`, `<admin-api-module>`, `<application-module>`.
- Исторические примеры могут содержать naming-исключения. Пример:
  `NotificationRouteEntity` не наследуется от `BaseEntity` и фактически
  является embedded/value object. Preferred naming проекта:
  `NotificationRoute`, без суффикса `Entity`.
- Runtime-значения, токены, реальные chat id, URL окружений и секреты из любых
  примеров не являются архитектурным стандартом и не копируются.
- Legacy-код проекта, созданный до этих правил, не исправляется вместе с
  несвязанной предметной задачей. Для такого изменения нужна отдельная задача.

## Domain checklist

### Package layout

Для feature в domain использовать стандартную раскладку:

- `entity` или текущий feature-domain package - root entity, value objects,
  enum/status/type;
- `port` - repository/id generator/external ports;
- `port/filters` - search/filter модели;
- `usecases` - domain use case-ы;
- `config` - feature facade `*Config`;
- `exceptions` - domain exceptions и error reason;
- `payloads` - validation payloads, если feature использует payload-based
  validation.

Примеры паттерна:

- `domain/.../resource/entity/ResourceEntity.java`
- `domain/.../featureSettings/entity/FeatureSettingsEntity.java`
- `domain/.../resource/port/ResourceRepository.java`
- `domain/.../featureSettings/config/FeatureSettingsConfig.java`
- `domain/.../featureSettings/usecases/UpdateFeatureSettingsUseCase.java`

### Root entity

Checklist:

- persisted root class именуется `*Entity`;
- имеет lifecycle/id и наследуется от подходящего base-класса:
  - `BaseEntity<String>` - обычная entity;
  - `BaseDeleteEntity<String>` - soft-delete entity;
  - `BaseExternalEntity<String>` - external links без soft-delete;
  - `BaseExternalDeleteEntity<String>` - external links + soft-delete;
- JavaDoc класса, полей и предметных методов написан на принятом в проекте языке;
- стандартные Lombok-аннотации:
  - `@EqualsAndHashCode(callSuper = false)`;
  - `@NoArgsConstructor`;
  - `@SuperBuilder`;
  - `@Data` или локально принятый `@Getter`/`@Setter`;
- для defaults использовать field initializer или `@Builder.Default`, если
  builder должен сохранять default;
- constructor `Entity(String id)` допустим, если нужен быстрый reference по id.

Примеры паттерна:

- `ResourceEntity extends BaseDeleteEntity<String>`;
- `AuthSessionEntity extends BaseEntity<String>`;
- `FeatureSettingEntity extends BaseEntity<String>`;
- `AccountEntity extends BaseExternalDeleteEntity<String>`.

### Value object / embedded domain model

Checklist:

- не наследуется от `BaseEntity`, если нет собственного id/lifecycle;
- в проекте не получает суффикс `Entity`;
- JavaDoc класса прямо объясняет, что это value/helper object и он не хранится
  в repository/БД самостоятельно;
- поля документированы на принятом в проекте языке;
- лежит рядом с root entity, если это часть feature-модели;
- использует простые Lombok-аннотации:
  - `@NoArgsConstructor`;
  - `@Getter`/`@Setter` или `@Data`;
  - `@SuperBuilder`/`@Builder`, если нужен builder.

Примеры паттернов и preferred naming:

- `AssignedData` - value object без base entity;
- `Deadline` - value object;
- `NotificationRouteEntity` - исторический legacy naming, по смыслу
  embedded route;
- preferred naming проекта: `NotificationRoute`.

### Enum/status/type

Checklist:

- enum не получает суффикс `Entity`;
- хранится в domain рядом с моделью, если относится только к feature;
- может быть nested enum внутри entity, если используется только этой entity;
- отдельный enum предпочтителен, если его используют entity, doc, request,
  response или несколько use case-ов.

Примеры паттерна:

- `ResourceEntity.Status`;
- `ResourceEntity.Priority`;
- `NotificationDirection`;
- `AuthSessionStatus`;
- `SystemViewType`.

### Repository port

Checklist:

- repository живет в domain `port`;
- обычная entity: `CRUDRepository<String, Entity, Filters>`;
- soft-delete entity: `SafeDeleteCRUDRepository<String, Entity, Filters>`;
- методы repository описывают domain queries, а не Mongo implementation
  details;
- каждый метод, объявленный в repository interface, имеет JavaDoc с объяснением
  business purpose;
- repository не содержит Spring/Mongo аннотаций.

Примеры паттерна:

- `FeatureSettingRepository extends CRUDRepository<String, FeatureSettingEntity, FeatureSettingFilters>`;
- `AuthSessionRepository extends CRUDRepository<String, AuthSessionEntity, AuthSessionFilters>`;
- `ResourceRepository extends SafeDeleteCRUDRepository<String, ResourceEntity, ResourceFilters>`;
- `ScheduleRepository extends SafeDeleteCRUDRepository<String, ScheduleEntity, ScheduleFilters>`.

### Id generator port

Checklist:

- интерфейс живет в domain `port`;
- именуется `*IdGenerator<T>`;
- наследуется от `BaseIdGenerator<T>`;
- concrete генерация id находится в infrastructure/mongo layer.

Примеры паттерна:

- `ResourceIdGenerator<T> extends BaseIdGenerator<T>`;
- `FeatureSettingIdGenerator<T> extends BaseIdGenerator<T>`;
- `AuthSessionIdGenerator<T> extends BaseIdGenerator<T>`.

### Filters

Checklist:

- filters лежат в `port/filters`;
- обычный поиск: `extends SearchFilters`;
- soft-delete поиск: `extends DeleteFilter`;
- аннотации:
  - `@NoArgsConstructor`;
  - `@SuperBuilder`;
  - `@Data`;
- filters не зависят от API request DTO и Mongo query classes.

Примеры паттерна:

- `FeatureSettingFilters extends SearchFilters`;
- `AuthSessionFilters extends SearchFilters`;
- `ResourceFilters extends DeleteFilter`;
- `ScheduleFilters extends DeleteFilter`.

### Use case

Checklist:

- каждый use case наследуется от `UseCase<Input, Output>` или подходящего
  abstract/base use case;
- use case не является Spring bean и не получает `@Service`/`@Component`;
- зависимости передаются через constructor, обычно `final` + Lombok
  `@RequiredArgsConstructor`;
- `execute(Input input)` всегда переопределяется через `@Override`;
- для пустого input использовать `VoidInputValues`;
- для id использовать `IdInputValues<String>`, если хватает стандартного input;
- для filters использовать `FiltersInputValues<Filters>`;
- custom input/output делать вложенными static classes, implements
  `UseCase.InputValues` / `UseCase.OutputValues`;
- для output использовать standard wrappers, если подходят:
  `SingletonEntityOutputValues`, `SingletonOptionalEntityOutputValues`,
  `SearchResultEntityOutputValues`, `VoidOutputValues`, `SingleOutput`.
- JavaDoc use case-а объясняет сценарий и business purpose;
- все методы use case-а документированы и проверены на то, что они не являются
  общими utility-методами.

Примеры паттерна:

- `FindFeatureSettingUseCase extends UseCase<VoidInputValues, SingletonEntityOutputValues<FeatureSettingEntity>>`;
- `UpdateFeatureSettingUseCase extends UseCase<InputValues, SingletonEntityOutputValues<FeatureSettingEntity>>`;
- `FindWorkspaceByIdUseCase extends AbstractForceFindByIdUseCase<String, WorkspaceEntity, WorkspaceRepository>`;
- `FindWorkspaceWithFiltersUseCase extends AbstractFindWithFiltersUseCase<WorkspaceEntity, WorkspaceFilters, WorkspaceRepository>`;
- `DeleteExternalAccountUseCase extends BaseDeleteUseCase<String, ExternalAccountEntity, ExternalAccountRepository>`;
- `CreateResourceUseCase extends UseCase<Input, Output>` для сложной бизнес-логики.

Подробности по use case-ам закреплены в
`08-backend-usecase-standards.md`.

### Feature config

Checklist:

- config живет в domain `config`;
- именуется `*Config`;
- не наследуется от base-класса;
- использует:
  - `@Accessors(fluent = true)`;
  - `@Getter`;
- хранит use case-ы как поля;
- constructor принимает domain ports, id generators, соседние use case/config
  dependencies и создает use case instances;
- другие слои получают use case как `featureConfig.create()` и запускают его
  через `UseCaseExecutor`;
- config не содержит Spring `@Configuration` и не ходит в Mongo/API.

Примеры паттерна:

- `FeatureSettingConfig`;
- `ResourceConfig`;
- `AuthSessionConfig`;
- `ScheduleConfig`.

### Exceptions and payloads

Checklist:

- domain exception живет в `exceptions`;
- not found сценарии наследуются от `NotFoundDomainException`;
- bad request/validation сценарии наследуются от `BadRequestDomainException`
  или соответствующего domain base exception;
- validation payload живет в `payloads` и наследуется от `ValidationPayload`;
- error reason enum живет рядом с exceptions, если feature различает причины.

Примеры паттерна:

- `FeatureSettingNotFoundException extends NotFoundDomainException`;
- `AuthSessionNotFoundException extends NotFoundDomainException`;
- `ExternalAuthException extends BadRequestDomainException`;
- `InvalidFeatureSettingIdPayload extends ValidationPayload`;
- `FeatureSettingErrorReason`.

## Mongo checklist

### Package layout

Для feature в mongo использовать раскладку:

- `documents` - Mongo documents и embedded docs;
- `mapper` или `mappers` - MapStruct mapper entity/doc;
- `queries` - query objects для filters;
- `port` - concrete Mongo repository и Mongo id generator.

Примеры паттерна:

- `mongo/.../resource/documents/ResourceDoc.java`;
- `mongo/.../resource/mapper/ResourceMapper.java`;
- `mongo/.../resource/queries/ResourceFiltersQuery.java`;
- `mongo/.../resource/port/MongoResourceRepository.java`;
- `mongo/.../resource/port/MongoResourceIdGenerator.java`.

### Document

Checklist:

- root document именуется `*Doc`;
- обычная entity: `extends BaseDocument`;
- soft-delete entity: `extends BaseDeleteDocument`;
- external links без soft-delete: `extends BaseExternalDocument`;
- external links + soft-delete: `extends BaseExternalDeleteDocument`;
- аннотации:
  - `@EqualsAndHashCode(callSuper = false)`;
  - `@AllArgsConstructor`;
  - `@NoArgsConstructor`;
  - `@SuperBuilder`;
  - `@Data`;
  - `@Document`;
  - `@CompoundIndexes`, если нужны индексы;
- defaults в doc должны совпадать с domain defaults;
- doc не содержит business methods;
- root doc не хранит domain `*Entity` напрямую;
- простые domain value/data objects без id/lifecycle можно хранить в root doc
  напрямую, если отдельная persistence representation не нужна.

Примеры паттерна:

- `ResourceDoc extends BaseDeleteDocument`;
- `FeatureSettingDoc extends BaseDocument`;
- `AuthSessionDoc extends BaseDocument`;
- `ExternalAccountDoc extends BaseDocument`;
- `ScheduleDoc extends BaseDeleteDocument`.

### Embedded document

Checklist:

- embedded doc не обязан наследоваться от `BaseDocument`;
- именуется `*Doc`;
- хранит только persistence representation вложенного object;
- использует простые Lombok-аннотации:
  - `@NoArgsConstructor`;
  - `@AllArgsConstructor`;
  - `@SuperBuilder`;
  - `@Data`;
- не имеет `@Document`, если не хранится отдельной коллекцией.
- не создается автоматически для каждого domain value object: если domain
  object является простым data/value object и не является `*Entity`, его можно
  использовать в root doc напрямую.

Пример паттерна:

- `NotificationRouteDoc` без base document и без `@Document`.

### Mapper

Checklist:

- mapper является MapStruct interface;
- именуется `<Feature>MongoMapper`;
- аннотация: `@Mapper(componentModel = "spring", uses = {ObjectIdMapper.class})`,
  если нужен id mapping;
- наследуется от `ProjectDataMapper<Entity, Doc>`;
- остаётся пустым, если модели совместимы: не переобъявляет унаследованные
  `map`/`inverseMap` и не задаёт `injectionStrategy` без реальной причины;
- не содержит business logic;
- custom mapping добавлять только для реальных несовпадений модели.

Примеры паттерна:

- `ResourceMongoMapper extends ProjectDataMapper<ResourceEntity, ResourceDoc>`;
- `FeatureSettingMongoMapper extends ProjectDataMapper<FeatureSettingEntity, FeatureSettingDoc>`;
- `AuthSessionMongoMapper extends ProjectDataMapper<AuthSessionEntity, AuthSessionDoc>`;
- `AccountMongoMapper extends ProjectDataMapper<AccountEntity, AccountDoc>`.

### Query object

Checklist:

- query class живет в `queries`;
- именуется `*FiltersQuery`;
- наследуется от `ProjectBaseQuery`;
- constructor принимает domain filters;
- `getCriteria()` строит Mongo criteria;
- `getQuery()` задает sort/limit/offset, если default базового класса не
  подходит;
- query object не возвращает domain entity и не вызывает mapper.

Примеры паттерна:

- `ResourceFiltersQuery extends ProjectBaseQuery`;
- `FeatureSettingFiltersQuery extends ProjectBaseQuery`;
- `AuthSessionFiltersQuery extends ProjectBaseQuery`;
- `GroupFiltersQuery extends ProjectBaseQuery`.

### Mongo repository

Checklist:

- class живет в `port`;
- именуется `Mongo*Repository`;
- аннотация: `@Repository`;
- обычная entity:
  `extends AbstractMongoRepository<String, Entity, Doc, Filters>`;
- soft-delete entity:
  `extends AbstractMongoSafeDeleteRepository<String, Entity, Doc, Filters>`;
- implements domain repository;
- constructor принимает `MongoTemplate` и mapper, вызывает
  `super(Doc.class, mapper, mongoTemplate)`;
- переопределяет `getSearchQuery(Filters filters)` и возвращает feature query;
- custom methods реализуют только persistence-specific query, а не business
  transition.

Примеры паттерна:

- `MongoFeatureSettingRepository extends AbstractMongoRepository<String, FeatureSettingEntity, FeatureSettingDoc, FeatureSettingFilters>`;
- `MongoAuthSessionRepository extends AbstractMongoRepository<String, AuthSessionEntity, AuthSessionDoc, AuthSessionFilters>`;
- `MongoResourceRepository extends AbstractMongoSafeDeleteRepository<String, ResourceEntity, ResourceDoc, ResourceFilters>`;
- `MongoScheduleRepository extends AbstractMongoSafeDeleteRepository<String, ScheduleEntity, ScheduleDoc, ScheduleFilters>`.

### Mongo id generator

Checklist:

- class живет в `port`;
- именуется `Mongo*IdGenerator`;
- аннотация: `@Component`;
- наследуется от `ObjectIdGenerator`;
- implements domain `*IdGenerator<ObjectId>`;
- для singleton/settings допускается deterministic id через override
  `generate()`/`parse(String)`.

Примеры паттерна:

- `MongoResourceIdGenerator extends ObjectIdGenerator implements ResourceIdGenerator<ObjectId>`;
- `MongoFeatureSettingIdGenerator extends ObjectIdGenerator implements FeatureSettingIdGenerator<ObjectId>`;
- `MongoAuthSessionIdGenerator extends ObjectIdGenerator implements AuthSessionIdGenerator<ObjectId>`.

### Indexes

Checklist:

- индексы объявлять на root `*Doc`;
- использовать `@CompoundIndexes` и `@CompoundIndex`;
- индексировать реальные query paths из `*FiltersQuery` и custom repository
  methods;
- не переносить чужие indexes механически, если в проекте нет таких queries.

Примеры паттерна:

- `ResourceDoc`: `spaceId_parentResourceId_updatedAt_desc`;
- `RecordDoc`: индексы по `spaceId`, `startDateTimeInstant`, `deleted`,
  `externalEventId`;
- `GroupDoc`: индексы по `taskId`, `ownerId_deleted`.

## API checklist

### Package layout

API использует feature-first раскладку. Первый package после API root является
владельцем кода; технические пакеты без feature-владельца запрещены. Для
feature использовать раскладку:

- `controllers` - REST controllers;
- `routes` - route constants;
- `request` - request DTO;
- `response` - response DTO;
- `mappers` - API mappers entity/response и request/filter.
- `handlers` - feature-specific `@RestControllerAdvice` и exception handlers.

Package invariants:

- API root содержит только module marker;
- `api.routes`, `api.controllers`, `api.dto` и `api.mappers` отсутствуют;
- корень feature не содержит controller, handler, DTO, route или mapper, если
  для роли предусмотрен подпакет;
- `*/controllers` содержит только классы `*ApiController`;
- cross-cutting `security` разделён минимум по фактическим ролям, например
  `authentication`, `credential`, `openapi`, `permissions`;
- reusable transport-код лежит в явно названных `base.controllers`,
  `base.context`, `base.response`, а не в feature-пакете.

Примеры паттерна:

- `api/.../resource/controllers/ResourceApiController.java`;
- `api/.../resource/routes/ResourceRouters.java`;
- `api/.../resource/request/ResourceCreateRequest.java`;
- `api/.../resource/response/ResourceResponse.java`;
- `api/.../resource/mappers/ResourceApiMapper.java`;
- `api/.../resource/mappers/ResourceUseCaseMapper.java` для request/use case input;
- `api/.../resource/handlers/ResourceExceptionHandler.java`.

### Controller

Checklist:

- класс находится в `<feature>.controllers` и именуется `*ApiController`;
- package `controllers` не содержит exception handlers и вспомогательные
  transport/security классы;
- controller получает `@RestController`;
- class-level `@RequestMapping` отсутствует;
- каждый `@GetMapping`/`@PostMapping`/`@PutMapping`/
  `@DeleteMapping` содержит полный URL из routes constant;
- `PUT`, `PATCH` или отдельная команда выбраны согласно семантике и
  принятому API-стандарту;
- controller получает `@Tag`, если feature входит в OpenAPI surface;
- authenticated controller наследуется от `AuthenticatedBaseController`;
- ADMIN-only endpoint вызывает унаследованный `requireAdmin()`; controller не
  объявляет собственную копию административной проверки;
- public/health/callback controller может быть обычным `@RestController`, если
  не нужен current user/credential context;
- controller зависит от domain `*Config`, API mapper, request mapper,
  `UseCaseExecutor` и auth/common dependencies;
- controller не зависит от Mongo repositories/docs/query classes;
- controller возвращает `<SuccessResponse><T>` или
  `<SuccessResponse><<PageResponse><T>>` в проектный API pattern;
- controller может извлечь проверенный auth context и запустить явный
  admin/access Use Case, но resource-level и business access-control decisions остаются
  в domain Use Case и не реализуются в controller.

Примеры паттерна:

- `ResourceApiController extends AuthenticatedBaseController`;
- `RecordApiController extends AuthenticatedBaseController`;
- `ProductApiController extends AuthenticatedBaseController`;
- `ExternalCallbackController` - public callback controller без common user
  context.

### Routes

Checklist:

- routes class живет в `routes`;
- именуется `*Routes` или existing local pattern `*Routers`;
- содержит только constants;
- root строится через общий prefix и имя collection во множественном
  числе: `/api/v1/features` для user API или `/api/admin/v1/features` для
  administrative API;
- `BY_ID`, action routes и public routes собираются от `ROOT`;
- endpoint constants содержат полный путь от `ROOT`/`BASE`, а не относительный
  suffix;
- controller использует constants, а не inline path strings.

Примеры паттерна:

- `ResourceRouters.ROOT = BaseRoutes.API + BaseRoutes.V1 + "/tasks"`;
- `ResourceRouters.BY_ID = ROOT + "/{id}"`;
- `PublicFeatureRoutes.BY_ID = BaseRoutes.PUBLIC + ROOT + "/{id}"`;
- `ExternalCallbackRouters.CALLBACK = BaseRoutes.NOT_SECURE + ROOT`.

### Request DTO

Checklist:

- request DTO живет в `request`;
- именуется `*Request`;
- обычно не наследуется от base response/entity classes;
- search request наследуется от `SearchApiRequest`;
- аннотации:
  - `@NoArgsConstructor`;
  - `@Getter`;
  - `@Setter`;
  - `@SuperBuilder`, если есть inheritance или нужен builder;
  - `@Schema`, если есть OpenAPI description;
- request DTO не передаётся напрямую в domain Use Case; API mapper/controller
  собирает `UseCase.InputValues`, domain command или filter.

Примеры паттерна:

- `ResourceCreateRequest`;
- `ChangeStatusRequest`;
- `SearchResourceRequest extends SearchApiRequest`;
- `SearchWorkspaceRequest extends SearchApiRequest`.

### Response DTO

Checklist:

- response DTO живет в `response`;
- persisted entity response:
  `extends BaseEntityResponse`;
- soft-delete entity response:
  `extends BaseDeleteEntityResponse`;
- nested/simple response без lifecycle не обязан наследоваться от base;
- аннотации:
  - `@NoArgsConstructor`;
  - `@SuperBuilder`;
  - `@Getter`;
- fields отражают public API contract, а не Mongo document.

Примеры паттерна:

- `ResourceResponse extends BaseDeleteEntityResponse`;
- `RecordResponse extends BaseDeleteEntityResponse`;
- `AccountResponse extends BaseEntityResponse`;
- `AuthSessionResponse extends BaseEntityResponse`;
- `FeatureResponse extends SharedResponse` как осознанное feature-specific
  исключение.

### API mapper

Checklist:

- mapper живет в `mappers`;
- аннотация: `@Mapper(componentModel = "spring", uses = {})`;
- entity-to-response mapper наследуется от
  `ProjectDataMapper<Entity, Response>`;
- request-to-filter mapper может наследоваться от
  `ProjectDataMapper<Filters, Request>` или быть отдельным mapper по текущему
  feature pattern;
- mapper не знает про Mongo docs.
- MapStruct entity/response mapper не импортирует request DTO и use case types;
- request/use case input mapping вынесен в отдельный обычный `*UseCaseMapper`
  Spring component.

Примеры паттерна:

- `ResourceApiMapper extends ProjectDataMapper<ResourceEntity, ResourceResponse>`;
- `RecordApiMapper extends ProjectDataMapper<RecordEntity, RecordResponse>`;
- `ScheduleApiMapper extends ProjectDataMapper<ScheduleEntity, ScheduleResponse>`;
- `SearchResourceMapper` для request/filter mapping.

### API wrapper response

Checklist:

- single result возвращать как `<SuccessResponse><Response>`;
- search result возвращать как
  `<SuccessResponse><<PageResponse><Response>>`;
- search items/count собирать через
  `<PageResponse>.withItemsAndCount(items, count)`;
- delete/status простые ответы допускают `<SuccessResponse><Boolean>` или
  `<SuccessResponse><String>`, если это уже feature contract.

Примеры паттерна:

- `ResourceApiController.create()` возвращает
  `<SuccessResponse><ResourceResponse>`;
- `ResourceApiController.search()` возвращает
  `<SuccessResponse><<PageResponse><ResourceResponse>>`;
- `RecordApiController.search()` использует
  `<PageResponse>.withItemsAndCount(...)`.

## Application checklist

### Spring application

Checklist:

- main application class получает `@SpringBootApplication`;
- `scanBasePackages` для `<ApplicationClass>` содержит полный стандартный
  набор `<base-package>`, `<platform-package>`, `<platform-package>`, `<platform-package>`;
- Feign включается через `@EnableFeignClients`, если есть Feign clients;
- method security включается отдельной Spring-аннотацией, если feature требует
  secured methods.

Пример паттерна:

- `Application` с `@SpringBootApplication(scanBasePackages = {...})`,
  `@EnableGlobalMethodSecurity`, `@EnableFeignClients`.

### AppConfig

Checklist:

- class живет в application `config`;
- аннотация: `@Configuration`;
- не наследуется от base-класса;
- содержит `@Bean` methods для:
  - `ObjectMapper`;
  - `UseCaseExecutor`;
  - domain `*Config`;
  - SDK/adapters/facades, только если библиотека не предоставляет их как
    component-scanned Spring bean;
  - external ports implementations, если они действительно собираются вручную;
- перед ручным `@Bean` для внешнего класса проверить его `@Component`,
  `@Service`, auto-configuration и уже импортированные configuration classes;
- не дублировать в `AppConfig` bean платформенной библиотеки, уже доступный
  через обязательный `scanBasePackages`; конфликт нельзя маскировать `@Primary` или случайным
  `@Qualifier`;
- `UseCaseExecutor` создается как `new ValidatingUseCaseExecutor()`;
- domain config bean принимает domain ports, id generators, соседние configs и
  adapters;
- `AppConfig` не реализует business operations.

Примеры паттерна:

- `AppConfig.objectMapper()`;
- `AppConfig.useCaseExecutor()`;
- `AppConfig.taskConfig(...)`;
- `AppConfig.userConfig(...)`;
- `AppConfig.calendarConnectorConfig(...)`.

### Web MVC config

Checklist:

- web config живет в application `config`;
- аннотация: `@Configuration`;
- implements `WebMvcConfigurer`, если настраивает converters, CORS,
  formatters, encoding;
- constructor dependencies через Lombok `@RequiredArgsConstructor` допустимы;
- charset/formatters/converters задаются здесь, а не в controllers.

Пример паттерна:

- `SpringWebMvcConfig implements WebMvcConfigurer`.

### Scheduler config

Checklist:

- scheduler pool config живет в application `config`;
- аннотация: `@Configuration`;
- implements `SchedulingConfigurer`;
- scheduler size задается через `ScheduledTaskRegistrar` и
  `ThreadPoolTaskScheduler`.

Пример паттерна:

- `SchedulingConfiguration implements SchedulingConfigurer`.

## Scheduler/runtime checklist

Checklist:

- runtime process/adapters живут вне domain, в scheduler/integration/runtime
  module;
- Spring scheduled class получает `@Component` и `@EnableScheduling`, если это
  локальный scheduler entrypoint;
- scheduled methods получают `@Scheduled`;
- runtime adapter может implements external listener/port interface;
- runtime adapter получает Use Case из `*Config`, собранного application layer,
  и запускает его через `UseCaseExecutor`;
- runtime adapter не должен хранить business state transition вне domain use
  case, кроме adapter-specific parsing/routing;
- External provider/HTTP SDK details остаются в runtime/integration layer, а не
  в domain entity/usecase.

Примеры паттерна:

- `ExternalUpdatesListener implements UpdatesListener`;
- `Scheduler` с `@Component`, `@EnableScheduling`, `@Scheduled`;
- `NotificationAdapter implements NotificationPort`.

## Cross-layer feature checklist

При добавлении нового feature-slice проверить весь путь:

- domain root/value models созданы в domain и названы по роли;
- root entity выбрала правильный `Base*Entity`;
- domain entity/value models, repository methods и use case-ы документированы
  по `10-backend-domain-documentation-and-utils.md`;
- domain filters/repository/id generator используют common contracts;
- use case-ы наследуются от `UseCase`/abstract base и подключены в `*Config`;
- Mongo doc выбрал matching `Base*Document`;
- Mongo mapper использует `ProjectDataMapper`;
- Mongo repository выбрал `AbstractMongoRepository` или
  `AbstractMongoSafeDeleteRepository`;
- Mongo query object наследуется от `ProjectBaseQuery`, если нужен search;
- Mongo id generator наследуется от `ObjectIdGenerator`;
- API request/response/mappers/controllers не зависят от Mongo;
- API response выбрал `BaseEntityResponse` или `BaseDeleteEntityResponse`;
- routes вынесены в constants;
- application `AppConfig` добавил bean domain config и необходимые adapters;
- scheduler/runtime code не попал в domain;
- Исторический legacy naming не переносится в проект, если он противоречит preferred
  standard.

## Связанные правила

- `01-backend-module-boundaries.md`
- `02-backend-feature-slice-and-config.md`
- `03-backend-api-transport.md`
- `04-backend-mongo-persistence.md`
- `05-backend-runtime-integrations-and-local-files.md`
- `07-backend-layer-inheritance-standards.md`
- `08-backend-usecase-standards.md`
- `10-backend-domain-documentation-and-utils.md`
