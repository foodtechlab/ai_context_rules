# Унаследованные поля в Backend Entity Map

- Время: `2026-09-12 17:27:00 +0300`
- Файлы:
  - `ai-context/baseline/apps/backend-entity-map/src/EntityNode.jsx`
  - `ai-context/baseline/apps/backend-entity-map/src/styles.css`
  - `ai-context/baseline/apps/backend-entity-map/src/data-model.js`
  - `ai-context/baseline/apps/backend-entity-map/schemas/generated.schema.json`
  - `ai-context/baseline/apps/backend-entity-map/schemas/user.schema.json`
  - `ai-context/baseline/apps/backend-entity-map/README.md`
  - `ai-context/baseline/skills/aic-collect-backend-entities/SKILL.md`
  - `ai-context/apps/backend-entity-map/data/generated.json`
- Промт пользователя: `смотри, в джаве есть наследование, если сущность наследует классы параметры этого класса должны тоже быть внутри сущности`
- Что сделано: skill обходит полную доступную цепочку наследования, включая
  исходники зависимостей, разрешает generic-типы и добавляет поля предков в
  `fields` конечной сущности.
- Что сделано: унаследованные поля содержат `inherited` и `declaredIn`, а
  интерфейс показывает класс их объявления непосредственно в карточке.
- Что сделано: тренировочные сущности дополнены полями `BaseDeleteEntity` и
  `BaseEntity`, найденными в Maven source JAR текущего backend.
- Что сделано: карточка показывает все поля без прежнего ограничения в шесть
  строк; контракты и runtime-валидация расширены метаданными наследования.
