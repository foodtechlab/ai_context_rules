# Добавлен стандарт параметров ai-context по двум scope

- Время: `2026-03-24 16:33:25`
- Файлы: `ai-context/README.md`, `ai-context/ai-rules/README.md`, `ai-context/ai-rules/008_ai-context-parameters-scope.md`, `ai-context/parameters/README.md`, `ai-context/parameters/repository/README.md`, `ai-context/parameters/repository/repository-parameters.yaml`, `ai-context/parameters/repository/_template/repository-parameters.yaml`, `ai-context/parameters/local-machine/README.md`, `ai-context/parameters/local-machine/.gitignore`, `ai-context/parameters/local-machine/local-machine.example.yaml`, `ai-context/update-policy.md`, `ai-context/promts/install-or-update-ai-context-prompt.md`, `ai-context/promts/update-ai-context-prompt.md`
- Что сделано: введен отдельный стандарт хранения параметров использования `ai-context` с двумя разрезами: repository-level и local-machine-level.
- Что сделано: создан versioned слой repository-параметров с шаблоном и текущим `repository-parameters.yaml`, а для local-machine параметров добавлены README, example и `.gitignore`, чтобы локальные секреты не попадали в git.
- Что сделано: правила, install/update policy и prompt-ы обновлены так, чтобы baseline-обновления не затирали параметры конкретного репозитория и не трогали machine-specific секреты.
