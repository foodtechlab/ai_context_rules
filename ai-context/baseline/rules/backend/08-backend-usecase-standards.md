# Use case-стандарты backend

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Дать переносимый профиль для domain use case-ов: как выбирать базовые классы,
input/output контракты и подключение сценариев через feature config.

## Ролевые примеры

Имена base classes и wrappers ниже — примеры платформенного Use Case pattern.
Перед применением их нужно сопоставить с реально подключённой библиотекой:

- `FindFeatureSettingUseCase extends UseCase<VoidInputValues, SingletonEntityOutputValues<FeatureSettingEntity>>`
- `UpdateFeatureSettingUseCase extends UseCase<InputValues, SingletonEntityOutputValues<FeatureSettingEntity>>`
- `FindAccountByIdUseCase extends AbstractFindByIdUseCase<String, AccountEntity, AccountRepository>`
- `FindAccountWithFiltersUseCase extends AbstractFindWithFiltersUseCase<AccountEntity, AccountFilters, AccountRepository>`
- `FindWorkspaceByIdUseCase extends AbstractForceFindByIdUseCase<String, WorkspaceEntity, WorkspaceRepository>`
- `PutExternalMessageUseCase extends AbstractCreateUseCase<ExternalMessageEntity, ExternalMessageIdGenerator, ExternalMessageRepository, InputValues>`
- `DeleteExternalAccountUseCase extends BaseDeleteUseCase<String, ExternalAccountEntity, ExternalAccountRepository>`
- сложные сценарии вроде `CreateResourceUseCase`, `DeleteResourceUseCase`,
  `SyncDataUseCase` наследуются напрямую от `UseCase<Input, Output>`.

## Базовое правило

- Каждый пользовательский, административный, scheduled или event-driven
  бизнес-сценарий оформляется отдельным Use Case с именем-действием.
  Новый generic `*Service` как контейнер CRUD и разных сценариев запрещён.
- Если проект использует общий Use Case contract, новый domain use case должен
  наследоваться от него или от подходящего abstract/base use case. Нельзя
  импортировать указанный в примере package, если его нет в зависимостях.
- Use case не должен быть обычным POJO с произвольным `execute()` без общего
  контракта.
- Метод выполнения всегда переопределяет `execute(Input input)` через
  `@Override`.
- Для сценария без входных данных использовать `VoidInputValues`, а не
  zero-arg `execute()`.
- Use case не должен быть Spring bean сам по себе. Он собирается в feature
  `*Config`, а `*Config` уже подключается в application layer через `AppConfig`.
- Зависимости use case-а передаются через constructor и хранятся как `final`
  поля. В domain use case не добавлять `@Service`, `@Component`, `MongoTemplate`
  или transport DTO.
- Оформление, размещение и документация UseCase определяются правилом
  `13-backend-usecase-layout-and-documentation.md`: JavaDoc класса и всех
  методов, кроме переопределённого `execute(...)`, обязателен.
- Use Case зависит только от domain repositories, gateway ports и других
  разрешённых domain abstractions, бросает domain exceptions и не импортирует
  MVC, Feign, SDK, Mongo и external DTO.

## Композиция сценариев

- Use Case не наследуется от другого Use Case ради скрытой проверки
  прав или общей бизнес-логики.
- Повторно используемая логика выносится в явно названный domain-компонент
  или validator и внедряется в Use Case.
- Вложенный запуск через `UseCaseExecutor` допустим только как осознанная
  orchestration с понятными validation и transaction semantics.
- Термин `Service` допустим в официальном имени типа внешней библиотеки
  или infrastructure API, но такой тип остаётся в gateway/application и не
  становится зависимостью Use Case.

## Как выбирать наследование

- Простой поиск по id обычной entity:
  `AbstractFindByIdUseCase<String, Entity, Repository>`.
- Поиск по id soft-delete entity с учетом deleted=false:
  `AbstractFindByIdUseCase<String, Entity, Repository>`, если нужен обычный
  `findById`.
- Force-поиск soft-delete entity, включая deleted=true:
  `AbstractForceFindByIdUseCase<String, Entity, Repository>`.
- Поиск по фильтрам:
  `AbstractFindWithFiltersUseCase<Entity, Filters, Repository>`.
- Простой hard-delete:
  `AbstractDeleteUseCase<String, Repository>` или проектный
  `BaseDeleteUseCase<String, Entity, Repository>`, если он есть в текущем
  module base.
- Safe-delete с проверками доступа, каскадом или side effects:
  прямое наследование от `UseCase<Input, Output>`.
- Простое создание entity с id generator и repository:
  `AbstractCreateUseCase<Entity, IdGenerator, Repository, Input>`.
- Простое обновление entity:
  `AbstractUpdateUseCase<Entity, Repository, Input>`.
- Singleton/settings чтение:
  `UseCase<VoidInputValues, SingletonEntityOutputValues<Entity>>`.
- Singleton/settings update:
  `UseCase<InputValues, SingletonEntityOutputValues<Entity>>`.
- Любой сценарий с бизнес-проверками, orchestration нескольких ports,
  access-control, notification side effects или provider calls:
  прямое наследование от `UseCase<Input, Output>`.

## Input contract

- Входная модель должна implements `UseCase.InputValues`.
- Если input только `id`, использовать `IdInputValues<String>`.
- Если input только filters, использовать `FiltersInputValues<Filters>`.
- Если input отсутствует, использовать `VoidInputValues`.
- Если input предметный, создавать вложенный static class `Input` или
  `InputValues`, который implements `UseCase.InputValues`.
- Java `record` или Lombok-класс для input выбирается по существующему
  project convention; смешивать разные модели без причины не следует.
- Для input-классов использовать локальный Lombok-паттерн, если он уже есть в feature:
  `@AllArgsConstructor(staticName = "of")`, `@NoArgsConstructor`,
  `@Getter`, `@SuperBuilder` или `@Builder` по необходимости.
- Input может содержать validation annotations; validation вызывается через
  общий `UseCase`/`UseCaseExecutor` contract.

## Output contract

- Выходная модель должна implements `UseCase.OutputValues`.
- Если output - одна entity, использовать
  `SingletonEntityOutputValues<Entity>`.
- Если output - optional entity, использовать
  `SingletonOptionalEntityOutputValues<Entity>`.
- Если output - search result, использовать
  `SearchResultEntityOutputValues<Entity>`.
- Если output отсутствует, использовать `VoidOutputValues`.
- Если output - одно простое значение, можно использовать `SingleOutput<T>`,
  если он доступен в зависимости и подходит по контракту.
- Если output предметный, создавать вложенный static class `Output`, который
  implements `UseCase.OutputValues`.
- Java `record` или обычный output class выбирается по project convention.
- Для custom output-классов использовать локальный паттерн:
  `@AllArgsConstructor(staticName = "of")` и `@Getter`.

## Feature config

- Feature `*Config` хранит use case-ы как поля и создает их в constructor-е.
- Другие слои получают use case через `featureConfig.useCaseName()` и запускают
  его через принятый `UseCaseExecutor`, например
  `executor.execute(taskConfig.create(), input)`.
- Controller, scheduler и integration adapters не должны создавать use case
  вручную.
- `AppConfig` создает Spring bean feature `*Config` и передает туда ports,
  id generators и соседние use case/config dependencies.

## Применение в проекте

- Новые use case-ы должны сразу соответствовать этому правилу.
- Legacy use case считается несоответствием только относительно явно принятого
  локального стандарта, а не из-за отличия от baseline-примера.
- Исправлять legacy use case-ы нужно отдельной задачей-рефакторингом, чтобы не
  смешивать архитектурную миграцию с предметными изменениями.
- Иллюстративная форма `featureSettings` после применения inheritance-стандарта:
  - `FindFeatureSettingsUseCase extends UseCase<VoidInputValues, SingletonEntityOutputValues<FeatureSettingsEntity>>`;
  - `UpdateFeatureSettingsUseCase extends UseCase<UpdateFeatureSettingsUseCase.InputValues, SingletonEntityOutputValues<FeatureSettingsEntity>>`;
  - `InputValues implements UseCase.InputValues`;
  - zero-arg `execute()` отсутствует.
- Для нейтрального `sampleFeature` expected форма:
  - `CreateSampleFeatureFromPhotoUseCase extends UseCase<Input, SingletonEntityOutputValues<SampleFeatureEntity>>` или `AbstractCreateUseCase`, если логика простая;
  - `AnalyzeSampleInputUseCase extends UseCase<Input, SingletonEntityOutputValues<SampleFeatureEntity>>`;
  - `ConfirmSampleFeatureUseCase extends UseCase<Input, SingletonEntityOutputValues<SampleFeatureEntity>>`;
  - `FindSampleFeatureByIdUseCase extends AbstractFindByIdUseCase<String, SampleFeatureEntity, SampleFeatureRepository>`;
  - `FindSampleFeatureWithFiltersUseCase extends AbstractFindWithFiltersUseCase<SampleFeatureEntity, SampleFeatureFilters, SampleFeatureRepository>`.

## Что запрещено

- Создавать новый use case без наследования от `UseCase` или подходящего
  abstract/base use case.
- Делать public `execute()` без input-аргумента; использовать
  `VoidInputValues`.
- Смешивать records, Lombok и обычные classes вопреки project convention.
- Возвращать raw entity, `Optional`, `List` или boolean напрямую из `execute`
  вместо `UseCase.OutputValues`.
- Принимать transport request DTO или Mongo document в use case input.
- Создавать use case в controller/scheduler/runtime вручную.
- Добавлять Spring annotations на domain use case.
- Добавлять `@Transactional`, MVC, Feign или Mongo annotations на domain Use Case.
- Складывать бизнес-логику в generic `AccountService`, `ResourceService` или аналогичный
  service-контейнер.
- Скрывать authorization в inheritance базового Use Case.

## Чеклист применения

- Определить сценарий use case: find by id, find by filters, create, update,
  delete, singleton settings или complex orchestration.
- Выбрать базовый класс: abstract/base use case или прямой `UseCase<Input,
  Output>`.
- Использовать готовый input wrapper, если подходит: `VoidInputValues`,
  `IdInputValues`, `FiltersInputValues`.
- Использовать готовый output wrapper, если подходит:
  `SingletonEntityOutputValues`, `SingletonOptionalEntityOutputValues`,
  `SearchResultEntityOutputValues`, `VoidOutputValues`, `SingleOutput`.
- Если нужны custom input/output, сделать static classes с implements
  `UseCase.InputValues`/`UseCase.OutputValues`.
- Добавить use case в feature `*Config`.
- Проверить, что controller/scheduler/listener/runtime получает use case через
  `*Config` и запускает его через `UseCaseExecutor`.
- Проверить, что use case не содержит переиспользуемых utility-методов, которые
  нужно вынести в `StringUtils`, `NumberUtils` или feature-specific utility.
- Проверить JavaDoc класса и комментарии внутренних методов по
  `10-backend-domain-documentation-and-utils.md`.
- Unit test Use Case проверяет happy path, business branches, domain errors и
  взаимодействие с domain components/ports без Spring context.
- Controller test отдельно проверяет API mapping и вызов `UseCaseExecutor`.

## Связанные правила

- `01-backend-module-boundaries.md`
- `02-backend-feature-slice-and-config.md`
- `07-backend-layer-inheritance-standards.md`
- `10-backend-domain-documentation-and-utils.md`
- `13-backend-usecase-layout-and-documentation.md`
