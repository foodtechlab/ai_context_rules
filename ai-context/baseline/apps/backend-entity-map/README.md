# Backend Entity Map

React-приложение на базе `@xyflow/react` для просмотра сущностей backend и
связей между ними.

## Ownership

- Код приложения и JSON Schemas находятся в replaceable
  `ai-context/baseline/apps/backend-entity-map/`.
- Данные текущего репозитория находятся в repo-local
  `ai-context/apps/backend-entity-map/data/`.
- `generated.json` формируется skill `$aic-collect-backend-entities`.
- `user.json` изменяется через интерфейс и никогда не перезаписывается skill.

## Запуск

Из корня целевого репозитория:

```bash
npm --prefix ai-context/baseline/apps/backend-entity-map install
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/backend-entity-map run dev
```

Открыть `http://localhost:4173`.

Production-like запуск:

```bash
npm --prefix ai-context/baseline/apps/backend-entity-map run build
AIC_REPO_ROOT="$PWD" npm --prefix ai-context/baseline/apps/backend-entity-map start
```

Порт можно изменить через `PORT`.

## Данные

Контракты находятся в `schemas/generated.schema.json` и
`schemas/user.schema.json`. Проверка текущих repo-local данных:

```bash
AIC_REPO_ROOT="$PWD" node ai-context/baseline/apps/backend-entity-map/scripts/validate-data.mjs
```

Интерфейс объединяет оба слоя, позволяет фильтровать элементы, просматривать
детали и редактировать `user.json`. Новое расположение узла автоматически
сохраняется после завершения его перетаскивания; кнопка ручного сохранения
остаётся доступной для фиксации всей текущей схемы. API сервера разрешает
запись только в фиксированный repo-local `user.json`.

Кнопка `Добавить сущность` открывает форму для ручного проектирования сущности,
enum или внутреннего класса вместе с полями и описаниями. Такие элементы
сохраняются в пользовательском слое, визуально выделяются коралловой пунктирной
рамкой и меткой `ПРОЕКТ` и не изменяются при обновлении generated-данных.

У каждого поля сущности интерфейс показывает `name`, `type` и `description`.
Для generated-слоя skill берёт описание только из комментария непосредственно
у объявления поля. Отсутствие такого комментария отображается явно.

Поля доступной цепочки наследования включаются в ту же карточку сущности и
помечаются именем класса, в котором они объявлены. Skill обходит также
доступные исходники зависимостей и разрешает generic-типы предков в контексте
конкретного потомка.
