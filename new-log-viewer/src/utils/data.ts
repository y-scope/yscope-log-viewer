import {Nullable} from "../typings/common";


/**
 * Finds the key in a map based on the provided value.
 *
 * @param map
 * @param value
 * @return The key if found, null otherwise.
 */
const getMapKeyByValue = <T, M>(map: Map<T, M>, value: M): Nullable<T> => {
    const entry = [...map].find(([, val]) => val === value);
    return ("undefined" !== typeof entry) ?
        entry[0] :
        null;
};

/**
 * Finds the value associated with the key that's nearest but less than or equal to a target key.
 *
 * @param map
 * @param targetKey
 * @return The value if found, null otherwise.
 */
const getMapValueWithNearestLessThanOrEqualKey = <T>(
    map: Map<number, T>,
    targetKey: number
): Nullable<T> => {
    let lowerBoundKey = -1;
    map.forEach((_, currentKey) => {
        if (currentKey <= targetKey && currentKey > lowerBoundKey) {
            lowerBoundKey = currentKey;
        }
    });

    return (-1 === lowerBoundKey) ?
        null :
        map.get(lowerBoundKey) as T;
};

/**
 * Creates an array of numbers in the range `[begin, end)` with the `i`th element computed as
 * `range[i - 1] + step`.
 *
 * If `args` is a number, it is interpreted as `end`, and `begin` is set to `0`.
 *
 * @param args
 * @param args.begin
 * @param args.end
 * @param args.step
 * @return The computed range.
 * @throws {Error} if `step` is 0.
 */
const range = (
    args: number | {begin: number, end: number} | {begin: number, end: number, step: number}
): number[] => {
    // If `args` is a number, interpret it as `end` with `begin` set to 0.
    if ("number" === typeof args) {
        return range({begin: 0, end: args});
    }

    // Assume `step` is 1 if not provided.
    let step = 1;
    if ("step" in args) {
        ({step} = args);
        if (0 === step) {
            throw new Error("Step cannot be zero.");
        }
    }

    // Generate the range depending on the sign of `step`.
    const {begin, end} = args;
    const result: number[] = [];
    if (0 < step) {
        for (let i = begin; i < end; i += step) {
            result.push(i);
        }
    } else {
        for (let i = begin; i > end; i += step) {
            result.push(i);
        }
    }

    return result;
};

export {
    getMapKeyByValue,
    getMapValueWithNearestLessThanOrEqualKey,
    range,
};
