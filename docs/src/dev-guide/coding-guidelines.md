# Coding guidelines

This project adheres to YScope's [contribution guidelines][yscope-guidelines] as well as the
project-specific guidelines below.

# Web Workers

## Importing Web Workers

When importing Web Worker files, use Vite's `?worker` query suffix syntax:

```ts
import MainWorker from "../services/MainWorker.worker?worker";

const worker = new MainWorker();
```

This special syntax tells Vite to transform the import as a Web Worker constructor. See
[Vite's Web Worker documentation][vite-worker-query-suffix] for more details.

# Naming

## Web Worker files

Name web worker files with the extension, `.worker.ts`. This is to:

* follow standard practices.
* allow [eslint.config.mjs][eslint-config-mjs] to ignore `.worker.ts` files, suppressing
  `eslint-plugin-import:import/default` errors caused by Vite's `?worker` import syntax.

## Index variables

To differentiate variables that use different starting indexes (0 vs. 1), use the following naming
convention:

* 0-based indexing variable names should end with the suffix `Idx`.
* 1-based indexing variable names should end with the suffix `Num`.

Similarly, variables that represent a total number of items should be named with the prefix `num`.

Examples:

* `logEventNum` for a 1-based indexing variable.
* `arrayIndexIdx` for a 0-based indexing variable.
* `numEvents` for the total number of events.

# React

## Omitting state variables from React Hooks

To avoid including a state variable in a React Hook's dependency array, you can use a reference
(mirror) to hold the current value of the state variable. The reference should use the same name as
the state variable with an additional `Ref` suffix. E.g., `logEventNumRef` is the reference variable
that corresponds to the `logEventNum` state variable.

[eslint-config-mjs]: https://github.com/y-scope/yscope-log-viewer/blob/main/eslint.config.mjs
[vite-worker-query-suffix]: https://vite.dev/guide/features.html#import-with-query-suffixes
[yscope-guidelines]: https://docs.yscope.com/dev-guide/contrib-guides-overview.html
