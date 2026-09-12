# Authentication и authorization в backend

## Статус

Доступно как baseline-правило. Применяется после сопоставления с security
architecture, API-контрактами и локальными правилами целевого репозитория.

## Граница ответственности

Внешний или встроенный auth-компонент проверяет credential и базовый доступ к
операции. Resource-level authorization и бизнес-проверки выполняются в
application/domain Use Case, где доступен предметный контекст.

Authentication подтверждает identity. Authorization отдельно отвечает на
вопрос, разрешено ли этой identity выполнить конкретное действие.

## Входящий запрос

1. Источник credential — Bearer header, cookie, custom header, mTLS или другой
   механизм — определяется опубликованным security-контрактом проекта.
2. Authentication filter/middleware валидирует credential и создаёт principal
   в стандартном security context framework.
3. Controller и Use Case получают identity через единый project abstraction,
   не разбирая token повторно.
4. Public endpoints перечислены явно и не используются как обход security.
5. Смена формата credential или header считается изменением API-контракта и
   требует тестов совместимости.

## Login, refresh и revoke

- Login, refresh, revoke и logout оформляются отдельными сценариями либо
  делегируются identity provider согласно архитектуре проекта.
- Refresh credential передаётся и хранится только способом, определённым
  моделью угроз; URL и пример body не задаются baseline-правилом.
- Если refresh token ротируется, клиент атомарно сохраняет новую credential
  pair и инвалидирует старую.
- Auto-refresh ограничен одной координированной попыткой; retry loop запрещён.
- Клиент ветвится по стабильному machine-readable reason/status, а не по
  локализованному сообщению.
- Password, access/refresh token, API key, cookie и service credential не
  логируются.

## Исходящие auth-вызовы

- Account-delegated и service-to-service operations используют разные явные
  domain ports либо разные auth modes одного адаптера.
- Domain port принимает domain command/result. DTO auth SDK остаются в gateway.
- Interceptor применяется только к тем outbound clients, чей контракт требует
  соответствующий credential.
- Входящий user credential не превращается в service credential и не
  форвардится неявно.
- Техническая identity получает минимально необходимые permissions.

## Проверка

- Protected и public requests проходят ожидаемые security boundaries.
- Проверены invalid/expired/revoked credential, insufficient permissions,
  refresh rotation и logout/revoke.
- Нет retry loop, credential leakage и неявного token forwarding.
- Resource-level authorization покрыта domain/application tests.

## Связанные правила

- `03-backend-api-transport.md`
- `19-backend-gateways-and-external-resources.md`
- `20-backend-errors-and-exceptions.md`

