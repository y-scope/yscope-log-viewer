# Using State References to Maintain Current Values in React Hooks

Whenever we encounter a `stateRef` reference alongside a `state` variable (e.g., `logEventNumRef` vs. `logEventNum`),
the reference is guaranteed to hold the current value of the state variable. We create these references (mirrors) to use the
current state values in React hooks without including the state variables in the dependency arrays.
