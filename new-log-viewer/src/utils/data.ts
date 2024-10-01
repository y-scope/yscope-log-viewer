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
 * Creates an array of numbers in the range `[start, stop)` with the `i`th element computed as
 * `range[i - 1] + step`.
 *
 * @param start
 * @param stop
 * @param step
 * @return The computed range.
 * @throws {Error} if `step` is 0.
 */
const range = (start: number, stop: Nullable<number> = null, step: number = 1): number[] => {
    const result: number[] = [];

    if (0 === step) {
        throw new Error("Step cannot be zero.");
    }

    // If only one argument is supplied, the argument is interpreted as `stop`, and `start` is set
    // to `0`.
    if (null === stop) {
        stop = start;
        start = 0;
    }

    if (0 < step) {
        for (let i = start; i < stop; i += step) {
            result.push(i);
        }
    } else {
        for (let i = start; i > stop; i += step) {
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
