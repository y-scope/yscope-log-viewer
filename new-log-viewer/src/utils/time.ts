/**
 *
 * @param callback
 */
const defer = (callback: ()=>void) => {
    setTimeout(callback, 0);
};

export {defer};
