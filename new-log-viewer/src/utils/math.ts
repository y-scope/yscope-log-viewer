/**
 * Clamps a number to the given range. E.g. If the number is greater than the range's upper bound,
 * the range's upper bound is returned.
 *
 * @param num The number to be clamped.
 * @param min The lower boundary of the output range.
 * @param max The upper boundary of the output range.
 * @return The clamped number.
 */
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export {clamp};
