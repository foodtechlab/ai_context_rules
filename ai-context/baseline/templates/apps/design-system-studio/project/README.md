# Project Design System

Эта директория принадлежит проекту. Она использует неизменяемую library из
`ai-context/baseline/apps/design-system-studio/` и сохраняет семь разделов:

1. `base-system/`
2. `tokens/`
3. `components/`
4. `layouts/`
5. `screens/`
6. `flows/`
7. `mockups/`

`design-system.json` хранит только общие metadata и settings. Каждая тема,
token, component, layout, screen, flow и mockup хранится в отдельном файле
`<id>.json` в своей директории. Файл содержит ровно одну сущность; монолитный
`studio.json` запрещён. Исходный код одной реализации также должен находиться
в отдельном файле, а barrel-файлы могут только реэкспортировать его.
