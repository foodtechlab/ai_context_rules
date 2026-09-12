# Ручное проектирование сущностей в Backend Entity Map

- Время: `2026-09-12 18:08:12 +0300`
- Файлы:
  - `ai-context/baseline/apps/backend-entity-map/src/App.jsx`
  - `ai-context/baseline/apps/backend-entity-map/src/EntityNode.jsx`
  - `ai-context/baseline/apps/backend-entity-map/src/EntityDesignerModal.jsx`
  - `ai-context/baseline/apps/backend-entity-map/src/styles.css`
  - `ai-context/baseline/apps/backend-entity-map/README.md`
- Промт пользователя: `Теперь я хочу на следующий этап выйти: когда к текущим "зафиксированным" данным, можно вручную через инфетфейс добавлять новые, что бы "спроектировать" новые сущности. Очень важно, что бы визуально это отличалось, что бы было точно понятно`
- Что сделано: добавлена форма проектирования сущности, enum или внутреннего
  класса с названием, qualified name, модулем, описанием, полями и значениями
  перечисления.
- Что сделано: новый элемент получает уникальный id, размещается около центра
  текущего viewport и атомарно сохраняется вместе с координатами в `user.json`.
- Что сделано: проектируемые узлы однозначно отделены от AI-данных коралловым
  фоном, пунктирной рамкой и меткой `ПРОЕКТ`; в minimap используется тот же
  отдельный цвет.
- Что сделано: в легенду и инспектор добавлено явное обозначение ручного
  проекта; JSON-редактор сохранён как расширенный режим.
- Проверки: Vite production build, generated/user/combined data validation и
  `git diff --check`.
