/**
 * Defers the execution of a callback function until the call stack is clear.
 *
 * @param callbackFn The callback function to be executed.
 */
const defer = (callbackFn: () => void) => {
    setTimeout(callbackFn, 0);
};

export {defer};
