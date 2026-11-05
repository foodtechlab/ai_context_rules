# Project Design Systems

Каждая дизайн-система репозитория хранится в собственной именованной
директории:

```text
design-system/<id>/
```

Например, рядом могут существовать `design-system/admin-console`,
`design-system/mobile` и `design-system/marketing`. Design System Studio за
один запуск работает только с одной системой, выбранной через
`AIC_DESIGN_SYSTEM_DIR`.
