# Gateways и внешние ресурсы

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Обязательная граница

Для внешнего микросервиса, SaaS, filesystem/object storage, MQ или иного
ресурса application/domain слой объявляет outbound port. Use Case зависит
только от этого порта:

```text
Use Case -> OutboundPort <- HTTP/Kafka/S3/...Adapter
```

Если проект не использует ports-and-adapters, та же граница должна быть явно
выражена средствами принятой архитектуры.

## Domain/application core

- Содержит port, domain command/result и business rules.
- Не импортирует framework HTTP clients, external SDK/contract DTO, database
  documents или configuration properties.
- Не принимает base URL, secret или transport-specific options во входных
  моделях сценария.

## Gateway adapter

- Реализует outbound port и содержит transport client/SDK, external DTO и mapper.
- Настраивает protocol headers, serialization, timeout/retry и техническую
  авторизацию.
- Преобразует external response в domain result.
- Переводит downstream error в согласованную integration/domain error.
- Не принимает business decisions.

Transport может отражаться в имени concrete adapter: `HttpAuthGateway`,
`KafkaEventGateway`, `S3FileGateway`. Domain interface не содержит transport
в имени, если transport не является частью бизнес-контракта.

## Межсервисные вызовы

1. Сначала искать опубликованный contract/SDK владельца сервиса.
2. SDK размещать за outbound port; его наличие не разрешает импорт в Use Case.
3. Явно выбирать auth mode: service identity, documented user delegation, mTLS
   или публичный downstream.
4. Не форвардить входящий credential автоматически.
5. Не подключать общий auth interceptor ко всем clients без проверки контракта.
6. URL, secret, timeout и retry policy находятся в runtime configuration.
7. Retry разрешён только с учётом идемпотентности, backoff и общего time budget.

## Узкое исключение для edge consumer

Тонкий edge/BFF consumer без собственного domain-слоя и бизнес-логики может
вызывать опубликованный client SDK непосредственно из transport handler.
Handler только валидирует, маппит и делегирует. При появлении собственной
orchestration или business rules нужны application service/Use Case и outbound
port.

## Запреты

- Controller бизнес-сервиса вызывает raw HTTP client, SDK или persistence API.
- Use Case вызывает transport client или external facade напрямую.
- Domain/application core зависит от gateway module.
- Gateway возвращает external DTO в domain.
- Public downstream используется без документированной модели угроз.
- Неидемпотентная операция имеет автоматический безлимитный retry.

## Проверка

- Unit test Use Case использует fake/mock outbound port.
- Adapter contract test проверяет mapping, headers, auth, timeout и errors.
- Runtime smoke с реальным downstream отмечается отдельно; mock test не
  выдаётся за live integration.

## Связанные правила

- `01-backend-module-boundaries.md`
- `05-backend-runtime-integrations-and-local-files.md`
- `08-backend-usecase-standards.md`
- `18-backend-auth-service.md`

