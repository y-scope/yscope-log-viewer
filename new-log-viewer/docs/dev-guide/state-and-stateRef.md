# Using state references to maintain current values in React Hooks

Whenever we encounter a `stateRef` reference alongside a `state` variable (e.g., `logEventNumRef`
and `logEventNum` in `StateContextProvider`), the reference is meant to hold the current value of
the state variable. We create these references (mirrors) to use the current state values in React
hooks without including the state variables in the dependency arrays.
