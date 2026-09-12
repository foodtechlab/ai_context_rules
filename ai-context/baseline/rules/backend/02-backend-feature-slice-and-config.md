# Feature-slice и config-структура backend

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Зафиксировать, как новая backend-фича раскладывается по текущему feature-slice
паттерну, чтобы AI не создавал случайные “service/utils/common” слои вне
реальной структуры проекта.

## Область применения

Новые предметные области и изменения внутри существующих feature-пакетов в
`<domain-module>`, а также зеркальные изменения в соседних
слоях.

## Правило

- Каждая бизнес-фича должна ориентироваться на существующий feature-пакет вида
  `<domain-package>.<feature>`.
- Внутри feature использовать принятый в проекте набор подпакетов, например:
  `config`, `entity` или `domain`, `exceptions`, `port`, `usecases`.
- `*Config` является feature-фасадом, через который другие модули получают
  доступ к use case-ам этой предметной области.
- Persisted domain root/entity-классы должны именоваться с суффиксом `Entity`
  по проектному naming-паттерну: `AccountEntity`, `ResourceEntity`,
  `FeatureSettingEntity`. Для новых entity использовать тот же стандарт:
  `<Feature>Entity`.
- Domain root/entity-класс с собственным `id`, `createdAt` и `updatedAt`
  должен наследоваться от `BaseEntity<String>`. Если сущность soft-delete, она
  должна наследоваться от `BaseDeleteEntity<String>`. Если нужны внешние ссылки,
  использовать `BaseExternalEntity<String>` или
  `BaseExternalDeleteEntity<String>` по фактической семантике.
- Вложенные value objects/embedded-модели без собственного id и lifecycle не
  должны называться `*Entity`, даже если в legacy-коде есть похожий класс с
  таким именем. Для таких объектов использовать предметное имя без суффикса,
  например `NotificationRoute`.
- Domain repository для обычной entity должен расширять
  `CRUDRepository<String, <Entity>, <Filters>>`, для soft-delete entity -
  `SafeDeleteCRUDRepository<String, <Entity>, <Filters>>`.
- Domain id generator должен расширять `BaseIdGenerator<T>`, чтобы контракт
  включал `generate()` и `parse(String)`.
- Filters должны расширять `SearchFilters`; для soft-delete поиска -
  `DeleteFilter`.
- Use case должен наследоваться от `UseCase<Input, Output>` или от готового
  abstract/base use case из подключённой платформенной библиотеки, если сценарий
  совпадает с базовым find/delete/action pattern. Подробный стандарт:
  `08-backend-usecase-standards.md`.
- Domain entity, value/helper objects, repository methods и use case-ы должны
  быть документированы по правилу
  `10-backend-domain-documentation-and-utils.md`. Структура пакета `entity`,
  Lombok-оформление и полная документация Entity определяются правилом
  `14-backend-entity-layout-and-documentation.md`.
- Новые use case-ы не должны быть обычными POJO с произвольным `execute()` и
  Java records для input/output. Для сценария без входных данных использовать
  `VoidInputValues`, а для входных/выходных моделей - классы, реализующие
  `UseCase.InputValues` и `UseCase.OutputValues`, либо готовые wrappers.
- Enum, status/type-классы и value/data objects не должны искусственно получать
  суффикс `Entity`: `ResourceCreatedFromType`, `Deadline`, `AssignedData`,
  `ColorData`, `NotificationRoute`.
- Feature config должен называться `<Feature>Config`, собирать use case-ы этой
  feature и использовать проектные аннотации `@Accessors(fluent = true)` + `@Getter`
  вместо ручных getter-методов.
- Use case-ы должны называться по сценарию: `Create*UseCase`,
  `Find*UseCase`, `Update*UseCase`, `Delete*UseCase`, `Sync*UseCase`,
  `Process*UseCase`, `Connect*UseCase` и похожие action-oriented имена.
- Domain ports должны называться `<Feature>Repository`,
  `<Feature>IdGenerator`, `<Feature>Filters` или явным provider-port именем,
  если это внешний контракт.
- Новые use case-ы должны добавляться в `usecases`, а их зависимости собираться
  через соответствующий `*Config`, а не конструироваться вручную в controller
  или runtime-коде.
- Порты и их контракты должны жить в feature-пакете domain-слоя, а реализации
  этих портов - в инфраструктурных модулях.
- Если фича уже имеет устоявшееся имя в текущем коде, его нужно сохранять во
  всех затронутых слоях. Legacy-несовпадения не нормализуются “по пути” без
  отдельной задачи-рефактора.
- При появлении transport/persistence части фичи она должна зеркально
  появляться в `<backend-root>/<admin-api-module>/<feature>` и `<backend-root>/<mongo-module>/<feature>` с той же предметной
  областью, а не маскироваться под чужую feature.

## Что запрещено

- добавлять новую бизнес-логику в `base`, если у нее есть конкретная предметная
  область;
- создавать “общий service” вместо явного use case-а в feature-пакете;
- называть persisted domain entity без суффикса `Entity`;
- называть value/helper object с суффиксом `Entity`, если он не хранится через
  repository и не наследуется от base entity;
- собирать use case вручную в controller, scheduler или integration-классе,
  обходя `*Config`;
- переименовывать текущие feature-пакеты и naming-конвенции без отдельной
  задачи на системный рефакторинг.

## Чеклист применения

- определить, существует ли уже feature-пакет для этой предметной области;
- если фича новая, выбрать имя пакета, которое можно последовательно провести
  через domain, api и mongo слои;
- добавить нужные подпакеты только там, где они реально используются;
- создать или расширить `*Config`, чтобы новый use case был доступен из
  runtime/API слоя по текущему паттерну проекта;
- проверить, что новый код не размазан между unrelated feature-пакетами;
- проверить JavaDoc/comment contract по
  `10-backend-domain-documentation-and-utils.md`.
