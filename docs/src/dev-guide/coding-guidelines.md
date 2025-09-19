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

Zustand is a state management tool, which allows creating global state stores that can be accessed
from anywhere. Please follow the guidelines below when using Zustand stores.

## File naming conventions

When creating Zustand stores, we follow these naming conventions:

* Simple stores: `{name}Store.ts` (camelCase) - single file containing all state and actions.
* Large stores: create `{name}Store/` folder with:
  * `create{Name}{Feature}Slice.ts` - individual feature slices (e.g., `createQueryConfigSlice.ts`).
  * `index.ts` - main store file that combines slices and exports the main store hook.
  * `types.ts` - defines all types / interfaces for the store.

## Store conventions

Guidelines for defining types, default values, and action naming conventions in Zustand stores.

### Type definitions

Split store types into three interfaces:

* `{Name}Values`: state variables
* `{Name}Actions`: action functions (methods that update state)
* `{Name}State`: union of values and actions

For large stores, split `{Name}State` into feature-specific slices (`{Name}{Feature}Slice`) and
combine them back into `{Name}State` using TypeScript intersection types.

```{code-block} ts
:caption: Example: Log export store types
:emphasize-lines: 1,5,9
interface LogExportValues {
    exportProgress: Nullable<number>;
}

interface LogExportActions {
    setExportProgress: (newProgress: Nullable<number>) => void;
}

type LogExportState = LogExportValues & LogExportActions;
```

### Default values

* Create an object for initial state values using the `{Name}Values` interface for type safety.
* Use uppercase constant naming with `_DEFAULT` suffix

```{code-block} ts
:caption: Example: Log export store default values
const LOG_EXPORT_STORE_DEFAULT: LogExportValues = {
    exportProgress: null,
};
```

### Action naming

Use clear, consistent naming patterns:

* `set{Property}` - simple state updates that directly assign a new value.
* `update{Property}` - complex logic involving API calls, multiple state updates, or asynchronous
  operations.

```{code-block} ts
:caption: Example: User store actions
:emphasize-lines: 2,5
const useUserStore = create<UserState>((set, get) => ({
    setName: (name) => {
        set({name});
    },
    updateProfile: async (data) => {
        set({isLoading: true});
        const result = await api.updateProfile(data);
        set({
            profile: result,
            isLoading: false
        });
    },
}));
```

## Feature-based slicing

When a Zustand store grows too large, split it into slices based on features such as functional
areas.

:::{warning}
Follow the principle of separation of concerns:
- Do: Slice by feature. e.g., query configuration, query results, or query controller.
- Don't: Slice by type. e.g., one file for all values or one file for all actions
:::

Each slice should be self-contained and represent a coherent unit of application functionality.

## Store access patterns

There are three ways to access Zustand stores, each with its own use cases.

### Inside store creation

Use `get()` and `set()` to access the store's own states:

```{code-block} ts
:caption: Example: View format store access - inside store slice creation
:emphasize-lines: 3,5,10
const createViewFormattingSlice: StateCreator<
    ViewState, [], [], ViewFormattingSlice
> = (set, get) => ({
    updateIsPrettified: (newIsPrettified: boolean) => {
        const {isPrettified} = get();
        if (newIsPrettified === isPrettified) {
            return;
        }
        // ...
        set({isPrettified: newIsPrettified});
        // ...
    },
}));
```

### Inside React components

There are two access patterns depending on whether the access should be reactive or non-reactive.

#### State values

Choose access pattern based on usage:

*Reactive access* - when the value is used in JSX or hook dependency arrays, causing re-renders:

```{code-block} ts
:caption: Example: Log export store value access - reactive
const exportProgress = useLogExportStore((state) => state.exportProgress);

// The progress should be printed when `exportProgress` updates.
useEffect(() => {
    console.log(exportProgress);
}, [exportProgress]);
```

*Non-reactive access* - when the value should not trigger re-renders or hook re-runs,
typically for one-time reads:

```{code-block} ts
:caption: Example: Log export store value access - non-reactive
// The progress should be printed only once when the component mounts.
useEffect(() => {
    const {exportProgress} = useLogExportStore.getState();
    console.log(exportProgress);
}, []);
```

#### Actions

Actions usually do not change after initialization, so always access them non-reactively:

```{code-block} ts
:caption: Example: Log export store action access - non-reactive
const handleExportButtonClick = useCallback(() => {
    const {exportLogs} = useLogExportStore.getState();
    exportLogs();
}, []);
```

### Outside React components

Always use non-reactive access since reactive subscriptions do not work for outside components.

```{code-block} ts
:caption: Example: An error handler that accesses the Notification store outside of any component
:emphasize-lines: 3,4,9
const handleErrorWithNotification = (e: unknown) => {
    // ...
    const {postPopUp} = useNotificationStore.getState();
    postPopUp({
        level: LOG_LEVEL.ERROR,
        message: message,
        timeoutMillis: DO_NOT_TIMEOUT_VALUE,
        title: "Action failed",
    });
};
```

[eslint-config-mjs]: https://github.com/y-scope/yscope-log-viewer/blob/main/eslint.config.mjs
[vite-worker-query-suffix]: https://vite.dev/guide/features.html#import-with-query-suffixes
[yscope-guidelines]: https://docs.yscope.com/dev-guide/contrib-guides-overview.html
