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
 * Creates an array of numbers in a specified range [startNum, startNum + steps].
 *
 * @param start The value of the start parameter (or `0` if the parameter was not supplied).
 * @param stop The value of the stop parameter.
 * @param step The value of the step parameter (or `1` if the parameter was not supplied).
 * - For a positive step, the contents of a range r are determined by the formula `r[i] = start +
 * step*i` where `i >= 0` and `r[i] < stop`.
 * - For a negative step, the contents of the range are still determined by the formula `r[i] =
 * start + step*i`, but the constraints are `i >= 0` and `r[i] > stop`.
 * @return An array of numbers from `start` to `stop` (exclusive) with a step of `step`.
 * @throws {Error} if `step` is 0.
 */
const range = (start: number, stop: Nullable<number> = null, step: number = 1): number[] => {
    const result: number[] = [];

    if (0 === step) {
        throw new Error("Step cannot be zero.");
    }
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
