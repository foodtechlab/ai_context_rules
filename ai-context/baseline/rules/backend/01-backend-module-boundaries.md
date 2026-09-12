# Границы backend-модулей

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Убрать неоднозначность при выборе модуля для backend-изменения и не допускать,
чтобы код попадал в неправильный слой только потому, что “так быстрее”.

## Область применения

Все изменения внутри `<backend-root>`, особенно при добавлении новой фичи,
интеграции, API endpoint-а, persistence-реализации или runtime-процесса.

## Правило

- Штатные классы, interfaces, implementations, framework components,
  configurations, mappers и utilities из уже подключённых библиотек имеют
  приоритет над дублирующей проектной реализацией. Перед созданием собственного
  класса нужно проверить зависимости и существующие контракты проекта.
- Если библиотечная реализация покрывает требование, использовать её внутри
  разрешённого инфраструктурного слоя или собрать штатный объект минимальным
  `@Bean`, когда он не является component. External SDK/facade всё равно обязан
  оставаться за domain port и не импортируется в Use Case или controller.
- Параллельную проектную infrastructure-реализацию удалять вместе с утратившими
  смысл constants и тестами. Domain port удаляется только если исчезла сама
  внешняя граница, а не потому, что для неё найден готовый SDK.
- Project-specific adapter допустим только для действительно отличающегося
  domain-контракта или поведения целевого продукта; причина отличия должна быть видна из
  типа, wiring или теста.
- `<domain-module>` хранит основной бизнес-контур: use case-ы, порты, сущности или
  domain-объекты, exceptions и feature-config. Каждая локальная фича живёт
  в собственном feature-пакете, например `<domain-package>.<feature>`.
- `<admin-api-module>` является transport-слоем внутренней админки
  платформы: controllers, request/response DTO, routes и transport-mappers.
- Все endpoint-ы управляемого агента должны находиться в отдельном
  `<agent-api-module>`. Admin API и Agent API могут использовать общий domain,
  gateway и persistence, но не должны размещать controllers, DTO и security
  policy друг друга в одном transport-модуле.
- Если `<agent-api-module>` использует общий controller base class, каждый
  защищённый controller должен наследоваться от него. Base class может
  предоставлять request context, но не должен подменять проверку подписи,
  machine identity или иные механизмы аутентификации.
- `<agent-api-module>` является единственным HTTP-владельцем содержимого
  installation script, runtime scripts, manifest и управляемой конфигурации
  агента. `<agent-artifacts-module>` хранит exact immutable resources и
  реализует catalog, но не объявляет HTTP endpoints. Admin API может отдавать
  metadata и прямой Agent API URL, но не raw script/config content.
- `<mongo-module>` является persistence-слоем: `documents`, `queries`, `mapper` и
  реализации domain-портов через Mongo.
- `<gateway-module>` хранит реализации внешних сервисов, SDK, внешних API и
  протокольных клиентов. Если внешний сервис реализует domain-порт, порт живет в
  `<domain-module>`, а его adapter/client implementation живет в
  `<gateway-module>`.
- Для внешних сервисов сначала создавать domain port, например
  `ExternalServicePort` или `LogPort`, и только затем gateway implementation.
- `<scheduler-module>` хранит фоновые процессы, планировщики и lifecycle/startup
  компоненты. Если runtime-процесс использует внешний SDK, SDK-specific
  implementation живет в `<gateway-module>`, а scheduler только запускает и
  останавливает его.
- `<application-module>` является bootstrap/runtime-конфигурацией: dependency
  wiring, web/serialization/scheduler config и точка входа. Он собирает только
  те transport-модули, которые реально входят в executable backend.
- Если изменение относится к интеграционной фиче, domain-часть должна жить в
  `<domain-module>`, а persistence-часть в `<mongo-module>`.
- Если изменение пересекает несколько слоев, его нужно раскладывать по
  соответствующим модулям, а не стягивать в один “удобный” модуль.

## Что запрещено

- класть REST controllers, request/response DTO или route constants в
  `<domain-module>`;
- размещать MongoTemplate, документы Mongo или persistence query-код в
  `<domain-module>` или `<admin-api-module>`;
- переносить бизнес-логику в `<application-module>` только потому, что там уже есть
  Spring bean wiring;
- размещать внешний SDK-код в `<domain-module>`, `<admin-api-module>` или
  `<application-module>`, если для него есть gateway-слой `<gateway-module>`.
- публиковать agent-facing endpoint или содержимое agent artifact через
  `<admin-api-module>`, `<application-module>` либо
  `<agent-artifacts-module>`.

## Чеклист применения

- определить, относится ли изменение к domain, transport, persistence,
  integration или runtime;
- проверить, не требует ли задача правок сразу в нескольких модулях;
- для domain-изменения сначала найти соответствующий feature-пакет в
  `<domain-module>`;
- для новой внешней интеграции сначала определить domain port в
  `<domain-module>`, затем реализовать его в `<gateway-module>`;
- для HTTP endpoint-а проверить, какие use case-ы должны быть вызваны из
  `<admin-api-module>`, а какие persistence-реализации уже есть в `<mongo-module>`;
- убедиться, что итоговый diff не нарушает границы модулей и не тащит чужую
  ответственность в неподходящий модуль.
