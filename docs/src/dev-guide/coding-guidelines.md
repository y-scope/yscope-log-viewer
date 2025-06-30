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

* Store files: `{name}Store.ts` (camelCase).
* Large stores: create `{name}Store/` folder with:
  * `index.ts` - main store file that combines slices.
  * `create{Name}{Feature}Slice.ts` - individual feature slices (e.g., `createQueryConfigSlice.ts`).

## Store structure

### Type definitions

Split store types into three interfaces:

* `{Name}Values` - state variables
* `{Name}Actions` - action functions
* `{Name}State` or `{Name}Slice` - combined type

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

* Create an object for initial state values.
* Type with `{Name}Values` interface for validation.

```{code-block} ts
:caption: Example: Log export store default values
const LOG_EXPORT_STORE_DEFAULT: LogExportValues = {
    exportProgress: null,
};
```

### Action naming

* `set{Property}` - simple state updates.
* `update{Property}` - complex logic, API calls, or multiple state updates.

```{code-block} ts
:caption: Example: Log export store actions
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

When a Zustand store file becomes too large, we should slice it based on features. Avoid slicing by type (e.g., all
values / actions in one object) - it's a common anti-pattern.

## Store access patterns

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

#### State values

Choose access pattern based on usage:

*Reactive access* - when the value is used in JSX or hook dependency arrays:

```{code-block} ts
:caption: Example: Log export store value access - reactive
const exportProgress = useLogExportStore((state) => state.exportProgress);

// The progress should be printed when `exportProgress` updates.
useEffect(() => {
    console.log(exportProgress);
}, [exportProgress]);
```

*Non-reactive access* - when the value should not trigger re-renders or hook re-runs:

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

Always use non-reactive access since reactive subscriptions do not work outside components.

[eslint-config-mjs]: https://github.com/y-scope/yscope-log-viewer/blob/main/eslint.config.mjs
[vite-worker-query-suffix]: https://vite.dev/guide/features.html#import-with-query-suffixes
[yscope-guidelines]: https://docs.yscope.com/dev-guide/contrib-guides-overview.html
