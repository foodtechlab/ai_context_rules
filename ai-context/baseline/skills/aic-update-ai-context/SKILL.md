---
name: aic-update-ai-context
description: Обновлять установленный ai-context текущего репозитория из настроенного source-of-truth с сохранением repo-local данных и обязательной проверкой результата. Использовать, когда пользователь просит обновить, синхронизировать или подтянуть актуальный ai-context.
---

# Update AI Context

Обновлять `ai-context` текущего репозитория только штатными baseline-скриптами.
Считать явный запрос пользователя на обновление разрешением заменить
baseline-owned файлы, но не расширять это разрешение на repo-local данные.

## Подготовка

1. Определить корень целевого репозитория через
   `git rev-parse --show-toplevel` и выполнять дальнейшие команды из него.
2. Прочитать полностью:
   - `ai-context/baseline/manifest.json`;
   - `ai-context/baseline/update-policy.md`;
   - `ai-context/parameters/repository-parameters.yaml`, если файл существует.
3. Взять URL source-of-truth из
   `source_of_truth.repo` файла `ai-context/baseline/manifest.json`. Не
   подменять его другим репозиторием без явного указания пользователя.
4. Убедиться, что существуют:
   - `ai-context/baseline/scripts/sync-ai-context.py`;
   - `ai-context/baseline/scripts/verify-ai-context.py`.

Если manifest, source URL или scripts отсутствуют, остановиться и объяснить,
что сначала требуется установить или восстановить `ai-context`. Не выполнять
ручной selective copy как fallback.

## Обновление

1. Запустить из корня целевого репозитория:

   ```bash
   python3 ai-context/baseline/scripts/sync-ai-context.py \
     --source-repo <source_of_truth.repo> \
     --target-dir .
   ```

2. Не передавать `--mode`, если пользователь явно не выбрал режим: скрипт
   должен определить его из repository parameters. Если пользователь явно
   указал режим, передать одинаковый `--mode` в sync и verify.
3. После sync заново прочитать обновленный
   `ai-context/baseline/update-policy.md`, затем запустить:

   ```bash
   python3 ai-context/baseline/scripts/verify-ai-context.py \
     --source-repo <source_of_truth.repo> \
     --target-dir .
   ```

4. Если sync или verify завершился ошибкой, не маскировать ее ручными
   исправлениями и не сообщать об успешном обновлении. Сохранить диагностику и
   указать безопасный следующий шаг.

## Границы

- Разрешено заменять только baseline-owned пути из update policy.
- Существующие repo-local файлы вне `ai-context/baseline/` и project outputs
  должны сохраняться.
- Не редактировать содержимое baseline вручную после sync.
- Не устанавливать и не обновлять `.agents/skills/`: это отдельный workflow.
- Не создавать task, task detail или changelog только из-за синхронизации
  `ai-context`.
- Не делать commit и не откатывать пользовательские изменения.

## Результат

Коротко сообщить:

- source repository и использованную ветку;
- режим `ai-context`;
- обновленные и удаленные baseline-файлы;
- созданные или сохраненные repo-local файлы;
- мигрированные legacy-пути и места для ручного review;
- итог verify.

Если список большой, суммировать его по категориям и отдельно показать ошибки
или требующие внимания пути.
