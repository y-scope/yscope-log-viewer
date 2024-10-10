/**
 *
 * @param callback
 * @param callbackFn
 */
const defer = (callbackFn: () => void) => {
    setTimeout(callbackFn, 0);
};

export {defer};
