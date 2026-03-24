# AI Context Rules

Репозиторий с baseline-правилами и структурой `ai-context` для рабочих
репозиториев.

Главная цель репозитория: дать команде и AI-агентам единый source-of-truth для
того, как организовывать контекст, задачи, changelog, параметры использования
и project-specific правила внутри проектов.

## Что здесь лежит

Основное содержимое находится в директории [`ai-context`](./ai-context):

- [`ai-context/README.md`](./ai-context/README.md) - обзор структуры и рабочего
  цикла;
- [`ai-context/update-policy.md`](./ai-context/update-policy.md) - правила
  установки и обновления baseline без перезаписи project-local данных;
- [`ai-context/ai-rules`](./ai-context/ai-rules) - постоянные межпроектные
  правила;
- [`ai-context/tasks`](./ai-context/tasks) - task-flow, backlog и детализация
  задач;
- [`ai-context/parameters`](./ai-context/parameters) - параметры использования
  `ai-context` на уровне репозитория и локальной машины;
- [`ai-context/rules`](./ai-context/rules) - project-specific архитектурные
  правила;
- [`ai-context/promts`](./ai-context/promts) - переиспользуемые prompt-like
  команды.

## Как использовать

Если в рабочем проекте нужно установить или обновить `ai-context`, актуальную
версию нужно брать из этого репозитория:

- `https://github.com/foodtechlab/ai_context_rules`

Брать нужно из основной ветки:

- `main`, если она существует;
- `master`, если репозиторий использует это имя основной ветки.

Перед копированием или обновлением нужно прочитать:

- [`ai-context/update-policy.md`](./ai-context/update-policy.md)

## Быстрые точки входа

- Как устроен `ai-context`: [`ai-context/README.md`](./ai-context/README.md)
- Как обновлять baseline: [`ai-context/promts/update-ai-context-prompt.md`](./ai-context/promts/update-ai-context-prompt.md)
- Как устанавливать baseline: [`ai-context/promts/install-or-update-ai-context-prompt.md`](./ai-context/promts/install-or-update-ai-context-prompt.md)
- Как работать с задачами: [`ai-context/tasks/README.md`](./ai-context/tasks/README.md)
- Как устроены параметры: [`ai-context/parameters/README.md`](./ai-context/parameters/README.md)

## Статус

Репозиторий развивается как source-of-truth для `ai-context` и может дальше
расширяться новыми baseline-правилами, шаблонами и workflow-соглашениями.
