# Описания полей Backend Entity Map

- Время: `2026-09-12 09:44:00 +0300`
- Файлы:
  - `ai-context/baseline/apps/backend-entity-map/src/EntityNode.jsx`
  - `ai-context/baseline/apps/backend-entity-map/src/styles.css`
  - `ai-context/baseline/apps/backend-entity-map/src/data-model.js`
  - `ai-context/baseline/apps/backend-entity-map/README.md`
  - `ai-context/baseline/skills/aic-collect-backend-entities/SKILL.md`
  - `ai-context/apps/backend-entity-map/data/generated.json`
- Промт пользователя: `в описании параметров мне не хватает описания этих параметров; описание агент который формирует данные, должен брать их комментариев которые располжены у полей класса`
- Что сделано: карточки сущностей показывают описание каждого поля под его
  именем и типом, а отсутствие комментария обозначается явно.
- Что сделано: skill обязан брать описание только из комментария,
  непосредственно связанного с объявлением поля, и не подменять его
  документацией методов или догадкой по имени.
- Что сделано: тренировочные данные дополнены описаниями из комментариев
  исходных Java-полей; устаревшие поля без соответствующего комментария
  оставлены с пустым описанием.
- Что сделано: runtime-валидация проверяет тип `field.description`.
