# Coding guidelines

This project adheres to YScope's [contribution guidelines][yscope-guidelines] as well as the
project-specific guidelines below.

# Naming

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

[yscope-guidelines]: https://docs.yscope.com/dev-guide/contrib-guides-overview.html
