# Coding guidelines

This project adheres to YScope's [contribution guidelines][yscope-guidelines] as well as the
project-specific guidelines below.

# Web workers

## Importing web workers

When importing web worker files, use Vite's `?worker` query suffix syntax:

```ts
import MainWorker from "../services/MainWorker.worker?worker";

const worker = new MainWorker();
```

This special syntax tells Vite to transform the import as a web worker constructor. See
[Vite's web worker documentation][vite-worker-query-suffix] for more details.

# Naming

## Web worker files

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

# Zustand

## File Naming

When creating Zustand stores, we follow these naming conventions:

* The store file name should be `xxxStore.ts`, where xxx is the name of the store in camelCase.
* If the file is too large and needs to be sliced, set the folder name to `xxxStore` and the store
creation file name to `index.ts`.

## Creation

### Values and actions

Zustand stores two types of data: state variables, i.e. values, and actions, which are functions that
modify these state variables.

We split values and actions in two different interfaces during the definition: `XxxValues` for values and `XxxActions`
for actions, both in PascalCase. Then we combine them with a type called `XxxState` for store creation. This is 

Here's a real-world example:

```ts
interface LogExportValues {
    exportProgress: Nullable<number>;
}

interface LogExportActions {
    setExportProgress: (newProgress: Nullable<number>) => void;
}

type LogExportState = LogExportValues & LogExportActions;
```

### Default values

We define default values for state variables during the creation.
The default values should be in CAPITAL_SNAKE_CASE. Here's the continuation of the previous example:

```ts
const LOG_EXPORT_STORE_DEFAULT: LogExportValues = {
    exportProgress: null,
};
```

Notice that we define `LOG_EXPORT_STORE_DEFAULT` using `LogExportValues` interface, which can help
type check the default values.

### Actions Naming

When implementing Zustand store actions, we follow these naming conventions:

* Use `setXxx` for actions that simply change the value of a state.
* Use `updateXxx` for actions that do more than simply changing a value (e.g., perform additional logic, make API calls,
update multiple states).

## Feature-based slicing

When a Zustand store file becomes too large, we should slice it based on features. Avoid grouping by type (e.g., all
values / actions in one object) — it's a common anti-pattern.

## Store Usage

There are three ways to access Zustand store values and actions:
* `get() & set()`
* `const yyy = useXxxStore((state) => state.yyy);`
* `const {yyy, zzz} = useXxxStore.getState();`

### Inside zustand creation

When accessing store values inside the store creation function, we use`set()` and `get()`. Here's an example:

```ts
const useLogExportStore = create<LogExportState>((get, set) => ({
    exportLogs: () => {
      const logExportManager = new LogExportManager();
      set({logExportManager});
      
      const {exportProgress} = get();
      // If name doesn't match, use colon to separate the variable name from the value.
      set({exportProgress: EXPORT_LOGS_PROGRESS_VALUE_MIN});
    },
}));
```


### Inside React components

#### State variables
`const vvv = useXxxStore((state) => state.vvv);`

This will assure whenever `vvv` changes, the component will re-render. For variables that are not subscribing to changes,
use `const {vvv} = useXxxStore.getState()`; instead. This avoids unnecessary dependencies in react hooks.

#### Actions
`const {aaa} = useXxxStore.getState();`

Since actions don't change after initialization, we can access them in a non-reactive way.

### Outside React components

When accessing Zustand store values or actions outside React components, we use
`const {yyy, zzz} = useXxxStore.getState();`.

[eslint-config-mjs]: https://github.com/y-scope/yscope-log-viewer/blob/main/eslint.config.mjs
[vite-worker-query-suffix]: https://vite.dev/guide/features.html#import-with-query-suffixes
[yscope-guidelines]: https://docs.yscope.com/dev-guide/contrib-guides-overview.html
