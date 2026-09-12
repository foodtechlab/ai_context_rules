# Runtime, интеграции и локальные backend-файлы

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Убрать путаницу между bootstrap/runtime-контуром, интеграционными модулями и
локальными runtime-файлами, чтобы AI не смешивал Spring wiring, SDK-адаптеры,
бот-процессы и секреты с domain-логикой.

## Область применения

Изменения в `<application-module>`, `<gateway-module>`, `<scheduler-module>`, локальных
runtime-файлах `src/main/resources`, `tokens/` и backend test-env артефактах.

## Правило

- `<application-module>` отвечает за Spring bootstrap и wiring: `AppConfig`,
  scheduler/web/swagger/object mapper config и точку входа приложения.
- Как executable boundary, `<application-module>` должен прямо объявлять
  runtime-зависимости, типы которых загружаются через component scan,
  reflection или framework auto-configuration. Не следует полагаться на
  случайный транзитивный экспорт через соседний модуль.
- `<application-module>` может собирать domain config-объекты и bean-зависимости, но
  не должен становиться местом для новой бизнес-логики.
- Если проект использует Spring Java configuration, `AppConfig` может быть
  обычным `@Configuration` классом без наследования: он объявляет `@Bean` для
  `UseCaseExecutor`, domain `*Config`,
  SDK/adapters и infrastructure facades, которых ещё нет среди scanned
  components или auto-configuration библиотеки.
- `<ApplicationClass>` сканирует только явно выбранные project и platform
  packages. Существующие framework components из этих namespaces нужно
  переиспользовать; создавать их копии в `AppConfig` нельзя.
- Backend использует принятую в проекте security chain. Параллельный filter или
  альтернативная authentication scheme допустимы только как осознанное
  изменение security-контракта с тестами и планом совместимости.
- Способ передачи access token определяется существующим API-контрактом:
  Bearer, cookie или custom header нельзя выбирать по умолчанию без проверки.
- Login и refresh оформляются отдельными application/domain scenarios либо
  делегируются identity provider. Gateway adapter переиспользует существующий
  auth client; идентичные копии его transport DTO без причины не создаются.
- Компонент проверки доступа собирается из существующих auth clients и
  adapters проекта; параллельная реализация не создаётся без необходимости.
- Web MVC config должен реализовывать `WebMvcConfigurer`, если настраивает
  converters, CORS, formatters или encoding.
- Scheduler config должен реализовывать `SchedulingConfigurer`, если настраивает
  `ScheduledTaskRegistrar` или scheduler pool.
- `<gateway-module>` хранит внешние SDK, клиенты внешних API и интеграционные
  адаптеры, которые реализуют domain-порты фактически нужных провайдеров.
- Runtime-код зависит от domain ports (`ExternalServicePort`, `LogPort` и
  похожие), а не от concrete SDK classes.
- `<scheduler-module>` хранит планировщики, startup/lifecycle-компоненты и
  notification jobs, которые вызывают use case-ы и gateway implementations.
- SDK implementation внешнего провайдера живёт в `<gateway-module>`, а scheduler
  отвечает только за lifecycle runtime-процесса.
- Если интеграция требует внешнего SDK или протокольного кода, этот код должен
  жить в интеграционном модуле, а domain-слой должен видеть только порт.
- Локальный secret-bearing runtime config игнорируется Git и не должен
  импортировать example-файлы по правилу
  `15-backend-example-config-runtime-import-ban.md`.
- Локальные токены, secret-bearing overrides, `credentials.json`,
  `client_secret_*`, `integration-data.txt` и похожие machine-specific файлы должны
  оставаться локальными и некоммитящимися.
- Для локального тестового окружения использовать существующий test-env контур
  репозитория, а не создавать параллельный ad-hoc layout.

## Что запрещено

- добавлять бизнес-валидацию и предметные state transition прямо в `AppConfig`,
  `ExternalServiceListener` или SDK-классы;
- повторно объявлять через `@Bean` внешний `@Component`/`@Service`, попадающий
  в application component scan;
- менять authentication header/scheme без проверки опубликованного контракта;
- оборачивать библиотечные auth DTO собственными идентичными моделями без
  необходимости изоляции внешнего контракта;
- коммитить локальный `application.yml`, действующие секреты и другие
  machine-specific runtime-файлы в
  `<backend-root>/<application-module>/src/main/resources`;
- импортировать example-конфигурации в runtime YAML или загружать их иным
  способом во время запуска;
- переносить внешний SDK-код в `<domain-module>` или `<admin-api-module>`;
- размещать новые фоновые процессы в transport-слое или в `<application-module>`
  только потому, что они используют Spring.

## Чеклист применения

- определить, является ли изменение bootstrap-конфигурацией, интеграцией,
  runtime-процессом или локальным runtime-артефактом;
- если нужен внешний провайдер, сначала определить domain port, затем
  реализовать его в `<gateway-module>`;
- если нужен планировщик или lifecycle job, разместить startup/trigger в
  `<scheduler-module>`, а внешний SDK/protocol implementation - в
  `<gateway-module>`;
- для локального runtime-файла оставить в git только шаблон или описание
  формата, а не сам секрет;
- проверить, что итоговое изменение не тянет интеграционный код в domain-слой.
