# Документация domain-слоя и границы utility-методов

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Зафиксировать обязательную документацию для ключевых элементов чистой
архитектуры и не допускать, чтобы бизнес-слой превращался в набор скрытых
utility-методов без явного domain-смысла.

## Область применения

Все изменения внутри `<domain-module>`, особенно:

- `entity` и `entity.common`;
- `port/*Repository`;
- `usecases`;
- новые вспомогательные domain-классы;
- private/helper методы внутри entity и use case-ов.

## Правило

- Каждый domain class в `entity` или `entity.common` обязан иметь JavaDoc на
  принятом в проекте языке документации.
- Если класс называется `*Entity`, он обязан быть настоящей persisted entity:
  иметь lifecycle, храниться через repository и наследоваться от подходящего
  базового класса (`BaseEntity<String>`, `BaseDeleteEntity<String>`,
  `BaseExternalEntity<String>` или `BaseExternalDeleteEntity<String>`).
- Если класс в `entity.common` не хранится в БД и не является
  persisted entity, он не должен называться `*Entity`. В JavaDoc класса нужно
  прямо написать, что это вспомогательный domain/value object и он не хранится
  в repository/БД самостоятельно.
- У каждого поля domain entity и вспомогательного domain/value object должен
  быть JavaDoc на принятом в проекте языке: что означает поле, кто его заполняет и какие
  важные ограничения у значения есть.
- Методы внутри entity являются центральной частью бизнес-логики. Каждый метод,
  явно объявленный в entity, должен иметь JavaDoc на принятом в проекте языке: какое
  бизнес-действие выполняет метод, какие инварианты проверяет или меняет и
  какие side effects внутри entity происходят. Исключение - методы,
  сгенерированные Lombok, и очевидные JavaBean getter/setter без собственной
  логики.
- Каждый метод, объявленный в domain repository interface, должен иметь JavaDoc
  на принятом в проекте языке. Комментарий метода обязан объяснять, на какой
  бизнес-вопрос отвечает метод и почему он нужен use case-у. Inherited методы
  из `CRUDRepository`/`SafeDeleteCRUDRepository` отдельно не дублируются.
- Каждый use case должен иметь JavaDoc на принятом в проекте языке у класса. Комментарий
  должен объяснять, какой пользовательский или системный сценарий реализует
  use case и почему эта логика находится именно в domain-слое.
- Каждый метод, явно объявленный в use case-е, кроме переопределённого
  `execute(...)`, должен иметь JavaDoc на принятом в проекте языке. Комментарий должен
  объяснять бизнес-смысл метода, входные ограничения, state transition или
  orchestration зависимостей. Для `execute(...)` действует запрет на
  дублирующий JavaDoc из
  `13-backend-usecase-layout-and-documentation.md`.
- Перед добавлением метода в entity или use case нужно проверить, не является
  ли он переиспользуемым utility-методом без предметного состояния.
- Если метод похож на stateless utility (`normalize`, `parse`, `format`,
  `isBlank`, `isPositive`, `clamp`, работа только со строкой/числом/датой без
  domain state), его нужно вынести в существующий общий utility-класс вроде
  `StringUtils` или `NumberUtils`, либо в явно named feature utility, если
  логика предметная.
- Предметный helper может оставаться внутри entity/use case только если он
  использует domain state или выражает локальное бизнес-правило текущего
  сценария. В комментарии должно быть понятно, почему это не общий utility.

## Что запрещено

- Создавать новый класс в `entity` или `entity.common` без JavaDoc класса.
- Оставлять поля entity/value object без комментариев.
- Называть value object, DTO-like helper, progress summary или calculation
  result с суффиксом `Entity`, если он не хранится через repository и не
  наследуется от base entity.
- Создавать `*Entity` без наследования от подходящего base entity.
- Оставлять предметные методы entity без комментариев.
- Добавлять методы в domain repository без объяснения их business purpose.
- Создавать use case без JavaDoc класса.
- Оставлять методы use case-а без комментариев.
- Держать в entity/use case статические или фактически статические
  преобразования строк, чисел, дат и коллекций, если они могут быть
  переиспользованы вне текущего класса.
- Создавать случайные `Utils` рядом с feature без причины. Общие операции
  должны идти в `<domain-package>.common.utils`, а feature-specific utility -
  называться по предметному смыслу и быть оправданным локальной задачей.

## Чеклист применения

- Для каждого нового или измененного класса в `entity` или `entity.common`
  проверить JavaDoc класса.
- Для каждого `*Entity` проверить, что это persisted entity с base inheritance
  и repository lifecycle.
- Для каждого не-`*Entity` класса в `entity.common` проверить, что
  JavaDoc явно говорит: класс вспомогательный и сам не хранится в БД.
- Для каждого поля domain model проверить комментарий на принятом в проекте языке.
- Для каждого явно объявленного метода entity проверить комментарий с описанием
  бизнес-смысла и инвариантов.
- Для каждого repository method, объявленного в интерфейсе, проверить JavaDoc с
  объяснением, зачем метод нужен use case-ам.
- Для каждого use case проверить JavaDoc класса.
- Для каждого метода use case проверить JavaDoc и не является ли метод общим
  utility.
- Перед завершением backend-задачи просмотреть diff по `entity`, `port` и
  `usecases` на предмет отсутствующих комментариев и спрятанных utility-методов.

## Связанные правила

- `02-backend-feature-slice-and-config.md`
- `07-backend-layer-inheritance-standards.md`
- `08-backend-usecase-standards.md`
- `09-backend-layer-checklists.md`
- `13-backend-usecase-layout-and-documentation.md`
- `14-backend-entity-layout-and-documentation.md`
