# Transport-правила backend API

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Зафиксировать роль HTTP API-модуля как transport-слоя и не допускать, чтобы
HTTP-контроллеры превращались в источник доменной логики, persistence-кода или
ручного wiring.

## Область применения

Все изменения внутри HTTP API-модулей, включая endpoint-ы, request/response
DTO, маршруты и transport mappers. Если проект разделяет пользовательский,
административный и machine-facing API, каждый из них сохраняет собственную
security policy и transport-контракты.

## Правило

- Префиксы версий и административных маршрутов должны следовать уже принятому
  API-контракту проекта. Административный API требует отдельной проверки прав;
  одной успешной аутентификации недостаточно.
- Public route допустим только для явно публичного endpoint либо endpoint с
  собственной документированной защитой. Public namespace нельзя использовать
  как обход незавершённой security-интеграции.
- Controller выполняет только HTTP mapping, validation boundary, API mapping и запуск
  Use Case через `UseCaseExecutor`. Прямой доступ к repository, Feign, SDK, gateway
  adapter или external service запрещён.
- Успех, коллекции и ошибки возвращаются через принятые в проекте response
  wrappers либо через документированный прямой HTTP-контракт. Controller не
  должен вручную собирать альтернативный error JSON.
- Request/response DTO не являются domain entity и не попадают в repository или
  gateway port.
- CRUD URI строится resource-oriented: collection во множественном числе, `id` в
  path, filters/pagination в query, command body в JSON. `GET` не меняет
  состояние. Выбор `PUT`, `PATCH` или отдельной команды следует семантике и
  опубликованному API-стандарту проекта.
- API-код раскладывается feature-first: первый пакет после
  `<admin-api-package>` обозначает владельца transport-кода, например
  `authorization`, `user`, `security` или явно общий `base`.
- Корневой API package содержит только marker-класс модуля. Общие пакеты вида
  `api.routes`, `api.controllers`, `api.dto`, `api.mappers` запрещены: route,
  DTO, mapper и handler должны принадлежать конкретной feature.
- Для каждой transport-фичи использовать подпакеты `controllers`, `request`,
  `response`, `routes`, `mappers` и `handlers` по необходимости. Не складывать
  controller, exception handler и DTO прямо в корень feature.
- В пакете с именем `controllers` могут лежать только REST controller-ы и
  абстрактные controller-base классы. Каждый такой класс именуется с суффиксом
  `ApiController`. `@RestControllerAdvice`, filters, providers, constants,
  configuration и другие вспомогательные классы в `controllers` запрещены.
- Exception advice конкретной feature живёт в `<feature>.handlers`. Общий
  transport advice допустим только в явно названном shared/base handler-пакете.
- Cross-cutting package также обязан быть разложен по ответственности. В
  частности, корень `security` не содержит реализаций: authentication filters,
  credential providers, OpenAPI schemes и permissions размещаются в
  `security.authentication`, `security.credential`, `security.openapi` и
  `security.permissions` соответственно.
- Общие transport abstractions допускаются только в `base` с явной ролью,
  например `base.controllers`, `base.context` и `base.response`; feature-код
  туда переносить нельзя.
- Контроллер должен работать через domain config-объекты и use case-ы, а не
  ходить напрямую в Mongo, SDK или runtime-классы.
- Когда контроллеру нужен текущий principal, credential или locale, он должен
  использовать существующий security/context abstraction проекта, а не
  дублировать извлечение и проверку контекста.
- Если проект определяет общий base controller для защищённых endpoint-ов,
  соответствующие controllers должны использовать его. Public, health и
  internal controllers могут обходиться без него, если их контракт этого не
  требует.
- Response DTO для persisted domain entity должен наследоваться от
  `BaseEntityResponse`; если entity soft-delete, response должен наследоваться
  от `BaseDeleteEntityResponse`. Простые nested response/request DTO без
  собственного entity-lifecycle могут оставаться без base-класса.
- Route constants должны жить в отдельном `routes` классе и использоваться в
  аннотациях controller-а, а не хардкодиться строками по месту.
- Способ объявления class-level или method-level routes должен быть единым в
  пределах проекта. Route constants используются только если это принятый
  локальный стандарт; смешивать несколько схем в одной feature нельзя.
- Request/response модели должны жить в transport-слое и не вытекать в domain
  как канонические сущности.
- MapStruct-mapper-ы должны оставаться в `mappers` и использоваться как слой
  преобразования между domain сущностями/фильтрами и transport DTO.
- MapStruct transport mapper должен расширять
  `ProjectDataMapper<<Entity>, <Response>>`, если это прямое преобразование
  domain entity в response.
- MapStruct entity/response mapper не должен собирать `UseCase.InputValues` или
  разбирать request DTO. Такое преобразование инкапсулируется в отдельном
  обычном Spring mapper-классе внутри `<feature>.mappers`.
- Контроллер может добавлять transport-level defaults или подмешивать текущий
  auth/access context, но основная бизнес-валидация и state transition должны
  оставаться в use case-ах.
- Для стандартных stateless-проверок строк controller использует готовые
  utilities, прежде всего `org.springframework.util.StringUtils.hasText`.
  Локальные private-копии `hasText`, `isBlank` и аналогичных методов запрещены.

## Headers

- Authentication header и его схема берутся из фактического security-контракта
  проекта; нельзя автоматически выбирать между Bearer, cookie или custom header.
- `Content-Type: application/json` используется для JSON body, а JSON-клиент
  отправляет согласованный `Accept`.
- Device, platform, tenant, locale и correlation headers передаются только при
  наличии явного endpoint/service contract.
- Наличие header constant в библиотеке само по себе не делает header обязательным.

## CRUD baseline

```text
POST   /api/v1/resources
GET    /api/v1/resources/{id}
GET    /api/v1/resources?offset=0&limit=20
PUT    /api/v1/resources/{id}
DELETE /api/v1/resources/{id}
POST   /api/v1/resources/{id}/restore
```

Для administrative resource используется та же форма после
`/api/admin/v1`.

## Что запрещено

- внедрять в controller MongoTemplate, Mongo repository implementation или
  внешний SDK вместо domain config/use case;
- возвращать domain entity напрямую как REST response без transport mapper-а;
- размещать route constants, request DTO и response DTO вне transport-пакета
  feature;
- создавать бесхозные технические пакеты непосредственно под API root;
- смешивать разные технические роли в корне feature или cross-cutting package;
- размещать в `*/controllers` классы, которые не являются controller-ами и не
  имеют суффикс `ApiController`;
- переносить бизнес-проверки и доменные изменения из use case-а в controller.
- объявлять в controller собственные string utility-методы, уже покрытые
  стандартной библиотекой, framework или подключёнными utilities.

## Чеклист применения

- определить feature-владельца и создать технический подпакет внутри неё;
- создать или расширить `<Feature>Routes` для нового endpoint-а;
- проверить отсутствие классов в корневых `api.routes`/`api.dto`/`api.mappers`
  и отсутствие non-controller классов в `*/controllers`;
- проверить единообразие принятой в проекте схемы объявления routes;
- подготовить request/response DTO и transport mapper-ы;
- подключить нужный `*Config` из domain-слоя;
- проверить, что controller не содержит persistence-кода и не знает о Mongo
  документах;
- убедиться, что response строится через mapper, а входные данные превращаются
  в use case input.
- проверить success body, HTTP status, error body, auth boundary, validation,
  mapper и OpenAPI/contract; одной компиляции недостаточно.
