# Backend-правила Trust Ops перенесены в baseline

- Время: `2026-09-12 07:28:12 +0300`
- Файлы и области:
  - `README.md`
  - `ai-context/README.md`
  - `ai-context/baseline/README.md`
  - `ai-context/baseline/guides/project-rules.md`
  - `ai-context/baseline/rules/backend/README.md`
  - `ai-context/baseline/rules/backend/01-backend-module-boundaries.md`
  - `ai-context/baseline/rules/backend/02-backend-feature-slice-and-config.md`
  - `ai-context/baseline/rules/backend/03-backend-api-transport.md`
  - `ai-context/baseline/rules/backend/04-backend-mongo-persistence.md`
  - `ai-context/baseline/rules/backend/05-backend-runtime-integrations-and-local-files.md`
  - `ai-context/baseline/rules/backend/06-backend-api-backward-compatibility.md`
  - `ai-context/baseline/rules/backend/07-backend-layer-inheritance-standards.md`
  - `ai-context/baseline/rules/backend/08-backend-usecase-standards.md`
  - `ai-context/baseline/rules/backend/09-backend-layer-checklists.md`
  - `ai-context/baseline/rules/backend/10-backend-domain-documentation-and-utils.md`
  - `ai-context/baseline/rules/backend/11-backend-mongo-document-annotation-standard.md`
  - `ai-context/baseline/rules/backend/12-backend-mongo-index-compatibility.md`
  - `ai-context/baseline/rules/backend/13-backend-usecase-layout-and-documentation.md`
  - `ai-context/baseline/rules/backend/14-backend-entity-layout-and-documentation.md`
  - `ai-context/baseline/rules/backend/15-backend-example-config-runtime-import-ban.md`
  - `ai-context/baseline/rules/backend/16-backend-unique-index-ban.md`
  - `ai-context/baseline/rules/backend/17-backend-mongo-index-annotation-standard.md`
  - `ai-context/baseline/rules/backend/18-backend-auth-service.md`
  - `ai-context/baseline/rules/backend/19-backend-gateways-and-external-resources.md`
  - `ai-context/baseline/rules/backend/20-backend-errors-and-exceptions.md`
  - `ai-context/baseline/rules/backend/21-backend-maven-version-management.md`
- Промт пользователя:
  ```text
  я хочу, что бы ты перенес правила бекенда в ai-context/baseline из /Users/rostislavmaslov/workspace/projects/toster-platform/trust-ops/ai-context/rules/backend
  ```
- Что сделано: 21 backend-правило и README скопированы без смысловой
  переработки в `ai-context/baseline/rules/backend/`.
- Что сделано: документация baseline дополнена описанием нового versioned
  раздела и указанием, что перенесенный Trust Ops-набор не применяется к другим
  проектам автоматически.
