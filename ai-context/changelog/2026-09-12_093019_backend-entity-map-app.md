# Backend Entity Map

- Время: `2026-09-12 09:30:19 +0300`
- Файлы и области:
  - `ai-context/baseline/apps/backend-entity-map/**/*`
  - `ai-context/apps/backend-entity-map/**/*`
  - `ai-context/baseline/templates/apps/backend-entity-map/**/*`
  - `ai-context/baseline/skills/aic-collect-backend-entities/**/*`
  - apps/skills manifests, parameters, ownership guides и README
- Промт пользователя:
  ```text
  Создать React-приложение на основе React Flow для схемы backend-сущностей.
  Основной набор данных должен формироваться специальным skill, а отдельный
  пользовательский JSON — храниться и изменяться из интерфейса. Поддержать
  элементы «Сущность», enum и «внутренний класс». Для тренировки использовать
  данные Trust Ops. Код приложения хранить в baseline, данные — в
  ai-context/apps и разделять по репозиториям.
  ```
- Что сделано: создан baseline runtime `backend-entity-map` на React 19,
  React Flow 12, Vite и локальном Express API.
- Что сделано: реализованы три типа узлов, связи, поиск, фильтры, minimap,
  инспектор, JSON-редактор пользовательского слоя и сохранение layout.
- Что сделано: разделены AI-managed `generated.json` и UI-managed `user.json`,
  добавлены JSON Schemas, bootstrap templates и защита repo-local данных от
  baseline-sync.
- Что сделано: добавлен универсальный skill `aic-collect-backend-entities`,
  который собирает полную backend-карту и изменяет только generated layer.
- Что сделано: подготовлен тренировочный sample из реальных domain-классов
  Trust Ops; `.agents` использован как источник правил анализа, поскольку
  данных о сущностях в нем не оказалось.
- Проверки: `npm install` без уязвимостей, Vite production build, Node syntax,
  GET dataset и PUT user-data API, фактическое сохранение user.json,
  combined data validation, skills install/verify, baseline sync/verify,
  сохранение repo-local user data и `git diff --check`.
