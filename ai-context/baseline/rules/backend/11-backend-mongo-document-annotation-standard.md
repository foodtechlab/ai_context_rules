# Стандарт `@Document` для Mongo `*Doc`

## Статус

Доступно как baseline-правило. Применяется после сопоставления с архитектурой,
стеком и локальными правилами целевого репозитория.

## Цель

Зафиксировать единый стандарт Mongo document classes: имя Mongo collection не
задается вручную в `@Document`, а выводится Spring Data из имени `*Doc` класса.
Это важно для совместимости с принятым backend-стилем проекта и для того, чтобы AI не
создавал скрытые расхождения между именем document class, repository, mapper и
физической collection.

## Область применения

Все классы внутри `<mongo-module>`, особенно:

- `**/documents/*Doc.java`;
- root Mongo documents;
- embedded Mongo documents;
- тесты, которые фиксируют Mongo annotation contract;
- repository/gateway-код, где явно указаны имена Mongo collection.

## Правило

- Root Mongo document class с суффиксом `*Doc` должен использовать только
  пустую annotation:

```java
@Document
public class SomeFeatureDoc extends BaseDocument {
}
```

- Запрещено явно задавать имя collection в `@Document`:

```java
@Document(collection = "someCollection") // запрещено
@Document("someCollection")             // запрещено
@Document(value = "someCollection")     // запрещено
```

- Embedded `*Doc`, который не хранится отдельной collection, вообще не должен
  иметь `@Document`.
- Если кажется, что нужна нестандартная collection name, это не решается через
  `@Document(collection = ...)`. Нужно отдельно описать migration/compatibility
  plan и получить явное решение, потому что это меняет persistence contract.
- Repository implementation должен передавать `Doc.class` в base repository и
  не должен компенсировать нестандартное имя collection ручными строками.
- Gateway-код с физическими именами collections, например
  `<ReferenceTransferGateway>`, должен соответствовать фактическому
  стандартному имени collection, которое выводится из `*Doc`.

## Обязательная проверка всего mongo-модуля

Каждый раз, когда задача затрагивает `<mongo-module>`, агент
обязан проверить полностью весь модуль `<mongo-module>`, а не только текущий
diff.

Минимальная проверка:

```bash
rg -n '@Document\\s*\\(([^)]*collection\\s*=|\"|value\\s*=)' <backend-root>/<mongo-module>/src/main/java
```

Если команда находит любой `@Document` с явным collection/value:

- исправить все найденные `*Doc` в модуле на `@Document`;
- для embedded docs удалить `@Document`, если document не является root
  collection;
- обновить unit-тесты, которые проверяют collection contract;
- проверить repository/gateway-код, где collection name указан строкой;
- добавить changelog с перечислением исправленных documents.

## Тестовый контракт

Для новых или измененных root `*Doc` тест должен проверять:

- класс имеет `@Document`;
- `documentAnnotation.collection()` пустой;
- `documentAnnotation.value()` пустой;
- индексы объявлены через `@CompoundIndexes`, если они нужны;
- поля не используют `@Indexed`: все MongoDB-индексы объявляются только на
  root `*Doc` через `@CompoundIndex`/`@CompoundIndexes` согласно
  `17-backend-mongo-index-annotation-standard.md`.

Пример:

```java
org.springframework.data.mongodb.core.mapping.Document documentAnnotation =
        SomeFeatureDoc.class.getAnnotation(org.springframework.data.mongodb.core.mapping.Document.class);

assertEquals("", documentAnnotation.collection());
assertEquals("", documentAnnotation.value());
```

## Что запрещено

- Создавать новый root `*Doc` с `@Document(collection = "...")`.
- Исправлять только один найденный `@Document(collection = "...")`, если
  полный scan `<mongo-module>` нашел другие такие же нарушения.
- Оставлять тесты, которые ожидают explicit collection name.
- Добавлять строковые имена новых collections в gateway/repository без сверки
  со стандартным именем `*Doc`.
- Менять физическое имя collection без отдельного migration/compatibility
  решения.

## Чеклист применения

- Если задача затрагивает `<mongo-module>`, выполнить полный scan всего
  `<backend-root>/<mongo-module>/src/main/java`.
- Проверить каждый найденный `*Doc`: root doc имеет `@Document` без параметров,
  embedded doc не имеет `@Document`.
- Проверить тесты Mongo documents и убрать ожидания explicit collection name.
- Проверить gateway/repository со строковыми collection names.
- Запустить релевантные mongo-тесты и `git diff --check`.

## Связанные правила

- `04-backend-mongo-persistence.md`
- `07-backend-layer-inheritance-standards.md`
- `09-backend-layer-checklists.md`
