# Универсальные backend-правила

Этот каталог содержит переносимый набор архитектурных и технических правил
для backend-проектов. Правила не привязаны к названию продукта, организации,
репозитория, Java package или конкретным именам модулей.

## Порядок применения

Перед использованием агент должен изучить целевой репозиторий и сопоставить
его реальную структуру с ролями из правил. Плейсхолдеры нельзя копировать в
код, конфигурацию или документацию буквально:

- `<backend-root>` — корень backend-кода;
- `<domain-module>` — доменный или application-core слой;
- `<admin-api-module>` — пользовательский, административный или иной HTTP API;
- `<agent-api-module>` — отдельный machine-facing API, если он существует;
- `<mongo-module>` — MongoDB persistence adapter;
- `<gateway-module>` — outbound integrations/adapters;
- `<scheduler-module>` — фоновые процессы и планировщики;
- `<application-module>` — executable/bootstrap модуль;
- `<base-package>` и производные — package/namespace целевого проекта;
- `<platform-package>` — package общей платформенной библиотеки, если она
  используется.

Если роли объединены в одном модуле, границы соблюдаются на уровне пакетов.
Если слоя, технологии или механизма в проекте нет, соответствующее правило не
применяется. Существующие архитектура, naming, API-контракты, библиотеки и
локальные `ai-context/rules/` имеют приоритет над примерами из этого набора.

Технологические правила применяются условно:

- Spring/Lombok/Maven-правила — только к проектам с этим стеком;
- MongoDB-правила — только к MongoDB persistence и после проверки принятой в
  проекте политики индексов;
- auth/error wrapper классы в тексте — ролевые примеры, которые нужно
  сопоставить с реальными контрактами проекта;
- имена `Resource`, `Account`, `Feature` и похожие обозначают примеры, а не требуемые
  доменные сущности.

## Набор правил

- `01-backend-module-boundaries.md` — границы domain, transport, persistence,
  integrations, runtime и bootstrap.
- `02-backend-feature-slice-and-config.md` — раскладка feature по слоям.
- `03-backend-api-transport.md` — HTTP transport, DTO, mapping и security boundary.
- `04-backend-mongo-persistence.md` — MongoDB persistence adapter.
- `05-backend-runtime-integrations-and-local-files.md` — runtime, integrations,
  scheduler и локальные конфигурации.
- `06-backend-api-backward-compatibility.md` — совместимость опубликованного API.
- `07-backend-layer-inheritance-standards.md` — переиспользование базовых
  контрактов слоёв.
- `08-backend-usecase-standards.md` — контракты Use Case и Input/Output.
- `09-backend-layer-checklists.md` — подробные проверки по слоям.
- `10-backend-domain-documentation-and-utils.md` — документация domain и utils.
- `11-backend-mongo-document-annotation-standard.md` — оформление Mongo documents.
- `12-backend-mongo-index-compatibility.md` — совместимость MongoDB indexes.
- `13-backend-usecase-layout-and-documentation.md` — структура и документация
  Use Case.
- `14-backend-entity-layout-and-documentation.md` — структура и документация Entity.
- `15-backend-example-config-runtime-import-ban.md` — запрет runtime-импорта
  example-конфигураций.
- `16-backend-unique-index-ban.md` — профиль проектов, где explicit unique
  indexes запрещены принятой политикой.
- `17-backend-mongo-index-annotation-standard.md` — профиль объявления MongoDB
  indexes через class-level annotations.
- `18-backend-auth-service.md` — границы authentication/authorization.
- `19-backend-gateways-and-external-resources.md` — outbound ports и adapters.
- `20-backend-errors-and-exceptions.md` — стабильный контракт ошибок.
- `21-backend-maven-version-management.md` — управление Maven-версиями.

## Как использовать

1. Определить стек и реальные роли модулей целевого репозитория.
2. Выбрать только применимые rule-файлы.
3. Заменить ролевые плейсхолдеры реальными путями и типами в локальных правилах
   либо детализации задачи.
4. При конфликте следовать локальным правилам и существующим контрактам проекта.
5. Для cross-layer изменения применять все относящиеся к нему правила.
