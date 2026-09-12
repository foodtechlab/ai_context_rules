# Skills Import Staging

Этот каталог предназначен для временного размещения skills, импортируемых из
других репозиториев.

Рекомендуемый путь:

```text
ai-context/skills/imports/<source-or-repository>/<candidate-skill>/
```

Не устанавливать skills напрямую из staging. Сначала обезличить и проверить
skill, присвоить префиксы `aic-` и `AIC: `, затем опубликовать его в
`ai-context/baseline/skills/` и добавить в skills manifest.
