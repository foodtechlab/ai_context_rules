# Ошибки и исключения backend

## Статус

Доступно как baseline-правило. Применяется после сопоставления с опубликованным
API-контрактом и локальными правилами целевого репозитория.

## API-контракт

Все ошибки одного API должны иметь единый документированный envelope либо
единый RFC-совместимый формат, например Problem Details. Конкретные имена
полей и wrapper-классов определяет проект.

Ошибка должна содержать стабильный machine-readable code/reason и корректный
HTTP status. Клиент не ветвится по локализованному title/message/details.

Пример ролевой структуры:

```json
{
  "errors": [{
    "code": "RESOURCE_NOT_FOUND",
    "message": "..."
  }],
  "status": 404,
  "path": "/api/v1/resources/id",
  "traceId": "..."
}
```

## Создание ошибки

1. Проверить, нет ли подходящего error code и exception в существующем contract.
2. Общий reason использовать только для действительно одинаковой семантики.
3. Feature-specific reason хранить рядом с владельцем предметного сценария.
4. Создать узкое exception/result от подходящего project abstraction.
5. Добавить localization keys, если API локализует presentation message.
6. Добавить domain/application и transport contract tests.

## HTTP mapping

Типовой ориентир:

- validation/bad request → `400`;
- unauthenticated → `401`;
- authenticated but forbidden → `403`;
- resource not found → `404`;
- conflict → `409`;
- rate limit → `429`;
- unexpected server failure → `500`.

Конкретный mapping должен следовать опубликованному контракту. Прикладное
exception нельзя случайно маппить как unknown `500`.

## Локализация

- Machine-readable code не зависит от locale.
- Locale определяется стандартным механизмом проекта: HTTP negotiation,
  profile setting или явно документированный header.
- Отсутствующий обязательный localization key считается дефектом.
- Локализованный message не используется как diagnostic/logging contract.

## Handler и downstream errors

- Использовать единый global handler/error factory проекта.
- Не создавать параллельный несовместимый error envelope.
- Downstream error явно сохраняется или переводится в domain/integration error;
  mapping покрывается contract tests.
- Correlation/trace id передаётся только в соответствии с observability и
  security policy проекта.

## Безопасность

- Client-visible details не содержат password, token, secret, SQL, stack trace
  или избыточные персональные данные.
- Неизвестное exception логируется server-side с correlation; клиент получает
  безопасную internal-error форму.
- В production response не раскрываются внутренние class names и topology.

## Проверка

Проверить HTTP status, stable code, envelope, localization, path/correlation и
отсутствие секретов. Отдельно проверить unknown exception и downstream error.
Компиляция exception-класса не заменяет API contract test.

## Связанные правила

- `03-backend-api-transport.md`
- `18-backend-auth-service.md`
- `19-backend-gateways-and-external-resources.md`

