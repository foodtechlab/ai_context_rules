# Задачи source-of-truth вынесены из устанавливаемого ai-context

- Время: `2026-11-04 18:57:03 +0300`
- Файлы и области:
  - `README.md`
  - `maintainer-context/README.md`
  - `maintainer-context/tasks/task-list.md`
  - `maintainer-context/tasks/task-details/01-001.md`
  - `ai-context/tasks/task-list.md`
- Промт пользователя:
  ```text
  ой, кажется я зрая так сделал. ты создал задачу внутри ai-context, а ты же его
  будешь клонировать потом в другие репо

  может задачи и детализизации именно для работы в текущем репо вынести? что бы
  случайно не попасть в чужие репо?
  ```
- Что сделано: создан source-repository-only контур `maintainer-context/`,
  который не участвует в установке и синхронизации `ai-context`.
- Что сделано: задача `01-001` и её detail-файл перенесены в maintainer-контур,
  а устанавливаемый repo-local `ai-context/tasks/task-list.md` снова не содержит
  задач развития source-of-truth.
- Что сделано: корневой README описывает новую ownership-границу и точку входа
  для maintainer backlog.
- Что не изменено: целевые репозитории продолжают использовать стандартный
  `ai-context/tasks/`; baseline templates и sync manifest не менялись.
