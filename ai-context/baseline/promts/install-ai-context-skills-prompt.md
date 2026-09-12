# Установка и обновление repository skills

## Триггеры

Применять эту инструкцию, когда пользователь пишет:

- `установи скилы`;
- `установи скиллы из ai-context`;
- эквивалентную явную команду установить или обновить skills из `ai-context`.

## Инструкция для AI

1. Считать текущую рабочую директорию корнем целевого репозитория.
2. Прочитать полностью:
   - `ai-context/baseline/guides/skills.md`;
   - `ai-context/baseline/skills/manifest.json`;
   - `ai-context/baseline/update-policy.md`.
3. Устанавливать skills в `.agents/skills/` текущего репозитория.
4. Запустить:

   ```bash
   python3 ai-context/baseline/scripts/install-ai-context-skills.py --target-dir .
   python3 ai-context/baseline/scripts/verify-ai-context-skills.py --target-dir .
   ```

   Без `--source-dir` и `--source-repo` скрипты берут свежий набор из
   source-of-truth, указанного в `ai-context/baseline/manifest.json`.
5. Если пользователь явно указал локальный source-of-truth checkout, передать
   его обоим скриптам через `--source-dir <path>`. Для явного remote override
   использовать `--source-repo <url>` и при необходимости `--branch <name>`.
6. При повторном запуске считать операцию обновлением уже установленных
   `aic-*` skills. Не сохранять ручной drift внутри управляемых копий.
7. Не изменять сторонние skills, отсутствующие в AIC state-файле и manifest.
8. Сообщить source, установленные/обновленные/неизменившиеся skills и результат
   verify.

Если agent runtime кэширует список skills, после успешной установки сообщить,
что может потребоваться перезапуск сессии для обнаружения нового набора.
