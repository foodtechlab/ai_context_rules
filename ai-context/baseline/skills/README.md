# Repository Skills

Этот каталог хранит канонические skills, которые `ai-context` устанавливает в
текущий репозиторий.

## Инварианты

- Единственный поддерживаемый scope — текущий репозиторий.
- Канонический источник — `ai-context/baseline/skills/` в source-of-truth.
- Рабочая копия устанавливается в `.agents/skills/` целевого репозитория.
- Имена директорий и поле `name` начинаются с `aic-`.
- `interface.display_name` начинается с `AIC: `.
- Состав управляемого набора задает `manifest.json`.
- Установщик заменяет содержимое управляемого skill целиком, поэтому локальные
  изменения нужно сначала перенести в staging и опубликовать в baseline.
- Skills, не перечисленные в manifest, установщик не изменяет.

Импорт и публикация сторонних skills описаны в
`ai-context/baseline/guides/skills.md`.

## Текущий набор

- `aic-backend-review-and-fix` — ревью и безопасное исправление backend-кода.
- `aic-collect-backend-entities` — сбор AI-generated данных для карты
  backend-сущностей.
- `aic-update-ai-context` — обновление `ai-context` из настроенного
  source-of-truth с обязательным verify.
