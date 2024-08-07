/**
 * Returns a number whose value is limited to the given range.
 *
 * @param num The number to be clamped.
 * @param min The lower boundary of the output range.
 * @param max The upper boundary of the output range.
 * @return A number in the range [min, max].
 */
const clamp = function (num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
};

export {clamp};
