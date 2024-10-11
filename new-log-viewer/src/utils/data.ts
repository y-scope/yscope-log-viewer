import {Nullable} from "../typings/common";
import {clamp} from "./math";


/**
 * Checks if `target` is bounded by the first and last value in a sorted array of numbers.
 *
 * @param data An array sorted in ascending order.
 * @param target
 * @return Whether `target` is within the bounds of the array's values.
 */
const isWithinBounds = (data: number[], target: number): boolean => {
    const {length} = data;
    if (0 === length) {
        return false;
    }

    return (target >= (data[0] as number)) && (target <= (data[length - 1] as number));
};

/**
 * Clamps a number using the first and last value in a sorted array of numbers.
 *
 * @param data An array sorted in ascending order.
 * @param num The number to be clamped.
 * @return The clamped number.
 */
const clampWithinBounds = (data: number[], num: number): number => {
    const {length} = data;
    if (0 === length) {
        return num;
    }

    return clamp(num, data[0] as number, data[length - 1] as number);
};

/**
 * Performs binary search to find the smallest index `i` in the range `[0, length)` where
 * `predicate` is true. `predicate` should be false for some prefix of the input range and true
 * for the remainder.
 *
 * @param length The length of the range to search.
 * @param predicate A function that takes an index and returns `true` or `false`.
 * @return The smallest index where `predicate(i)` is true, or `length` if no such index exists.
 * @example
 * const arr = [1, 3, 5, 7, 10, 15, 20];
 * const result = binarySearch(arr.length, (i) => arr[i] >= 10);
 * console.log(result); // Output: 4 (since arr[4] is 10).
 */
const binarySearch = (length: number, predicate: (index: number) => boolean): number => {
    // Generic implementation based on Go standard library implementation.
    // Reference: https://pkg.go.dev/sort#Search
    let i = 0;
    let j = length;
    while (i < j) {
        const mid = Math.floor((i + j) / 2);
        if (false === predicate(mid)) {
            i = mid + 1;
        } else {
            j = mid;
        }
    }

    return i;
};

/**
 * Finds the largest index `i` in a sorted array `data` such that `data[i] <= target`. Uses binary
 * search for efficiency.
 *
 * @param data An array sorted in ascending order.
 * @param target
 * @return The largest index where `data[i] <= target` or:
 * - `length` if no such index exists.
 * - `null` if array is empty.
 * @example
 * const arr = [2, 3, 5, 7, 10, 15, 20];
 * const result = findNearestLessThanOrEqualElement(arr, 8);
 * console.log(result); // Output: 3 (since arr[3] is 7).
 */
const findNearestLessThanOrEqualElement = (data: number[], target: number): Nullable<number> => {
    const {length} = data;

    if (0 === length) {
        return null;
    }

    // Binary search to find the first index where data[i] > target.
    const firstGreaterIdx: number = binarySearch(length, (i) => data[i] as number > target);

    if (0 === firstGreaterIdx) {
        return length;
    }

    return firstGreaterIdx - 1;
};

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
    clampWithinBounds,
    findNearestLessThanOrEqualElement,
    getMapKeyByValue,
    getMapValueWithNearestLessThanOrEqualKey,
    isWithinBounds,
    range,
};
