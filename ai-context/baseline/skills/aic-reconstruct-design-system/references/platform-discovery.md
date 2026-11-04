# Platform discovery

Использовать только разделы обнаруженных платформ. Это routing guide, а не
исчерпывающий список filenames.

## Общие исключения

Не анализировать как handwritten UI:

- `.git`, dependency/vendor directories и package caches;
- build output, coverage, temporary files и IDE caches;
- generated sources, codegen output и vendored SDKs;
- binary assets без связи с resource catalog или UI usage;
- golden/snapshot output как source of truth, если существует UI source.

Generated файл можно читать для восстановления связи, только если handwritten
source отсутствует; помечать такую evidence как низкую confidence.

## Flutter

Признаки: `pubspec.yaml`, `lib/`, Flutter dependency.

Сначала проверить:

- `pubspec.yaml`: assets, fonts, packages и platform targets;
- `lib/main*.dart`, app/root widgets и dependency injection;
- `ThemeData`, `ColorScheme`, `TextTheme`, `ThemeExtension`;
- reusable widgets, feature presentation directories и shared UI;
- `Navigator`, Router API, `go_router`, `auto_route` или иной route registry;
- responsive builders, MediaQuery/LayoutBuilder и platform branches;
- widget/golden tests и preview fixtures как дополнительную evidence.

Исключать `.dart_tool/`, `build/`, generated `*.g.dart`, `*.freezed.dart` и
plugin registrants, если они не единственный navigation index.

## iOS / SwiftUI / UIKit

Признаки: `.xcodeproj`, `.xcworkspace`, `Package.swift`, Swift/Objective-C UI.

Сначала проверить:

- targets и build settings проекта/workspace;
- app entry, Scene/AppDelegate и root navigation;
- SwiftUI `View`, `ViewModifier`, `ButtonStyle`, environment/theme objects;
- UIKit view/view controller subclasses, reusable cells и appearance proxies;
- asset catalogs, named colors, image sets и custom fonts;
- NavigationStack/NavigationPath, coordinators, routers, segues и deep links;
- size classes, Dynamic Type, accessibility labels/traits и previews.

Исключать `DerivedData`, Pods, Carthage build output, `.build` и generated
resource accessors, если исходный catalog доступен.

## Android / Jetpack Compose / Views

Признаки: `settings.gradle*`, `build.gradle*`, `AndroidManifest.xml`, Android
plugins.

Сначала проверить:

- modules, application module и product flavors;
- Compose `MaterialTheme`, color/typography/shape definitions;
- `@Composable` UI, modifiers, previews и state holders;
- XML layouts, styles, themes, drawables, dimens, colors и navigation graphs;
- activities/fragments, Compose Navigation, deep links и bottom/tab navigation;
- window size classes, qualifiers, accessibility semantics/contentDescription.

Исключать `.gradle/`, `build/`, generated `R`, databinding/viewbinding output и
external build directories.

## Web / React and other browser UI

Признаки: `package.json`, browser entry, JSX/TSX/Vue/Svelte/templates.

Сначала проверить:

- package manifest, UI/component libraries и styling stack;
- global styles, CSS variables, theme providers и token files;
- shared components, component stories/tests and feature UI;
- router configuration, layouts, pages and lazy routes;
- media/container queries, responsive utilities and accessibility attributes;
- Storybook or equivalent examples as supporting evidence.

Исключать `node_modules`, `.next`, `dist`, `build`, coverage, generated clients
и bundled assets.

## Mixed projects

Если выбранная директория содержит несколько platform implementations одного
продукта, строить общий inventory и отмечать platform-specific variants. Если
это независимые приложения, запросить более узкую директорию.

Не считать одинаковые названия доказательством общего компонента: подтвердить
назначение, inputs, behavior и visual role по каждой платформе.
