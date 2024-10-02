import {Nullable} from "../typings/common";


/**
 * Checks if 'x' is bounded by the first and last value in a sorted array of numbers.
 *
 * @param data Sorted array.
 * @param x Target value.
 * @return True if is `x` is within bounds and false if outside of bounds or array is empty.
 */
const isWithinBounds = (data: number[], x: number): boolean => {
    const {length} = data;
    if (0 === length) {
        return false;
    }

    return (x >= (data[0] as number)) && (x <= (data[length - 1] as number));
};

/**
 * Performs binary search to find the smallest index `i` in the range [0, length) where the
 * `conditionFn` is true. Assumes that the `conditionFn` is false for some prefix of the
 * input range and true for the remainder. The most common use is find the index `i` of
 * a value x in a sorted array.
 *
 * @param length The length of the range to search.
 * @param conditionFn A function that takes an index and returns `true` or `false`.
 * @return The smallest index where `conditionFn(i)` is true. If no such index exists, returns
 * `length`.
 * @example
 * const arr = [1, 3, 5, 7, 10, 15, 20];
 * const result = binarySearch(arr.length, (i) => arr[i] >= 10);
 * console.log(result); // Output: 4 (since arr[4] is 10).
 */
const binarySearch = (length: number, conditionFn: (index: number) => boolean): number => {
    // Generic implementation based on Go standard library implementation.
    // Reference: https://pkg.go.dev/sort#Search
    let i = 0;
    let j = length;

    while (i < j) {
        const mid = Math.floor((i + j) / 2);

        if (false === conditionFn(mid)) {
            i = mid + 1;
        } else {
            j = mid;
        }
    }

    return i;
};

/**
 * Finds the largest index `i` in a sorted array `data` such that `data[i] <= x`.
 * Uses binary search for efficiency. Returns 0 if `x` is less than `data[0]`.
 *
 * @param data Sorted array.
 * @param x Target value.
 * @return The largest index where `data[i] <= x`. There are 2 edge cases where returns:
 * - 0 if `x` is less than `data[0]`.
 * - `null` if array is empty.
 * @example
 * const arr = [2, 3, 5, 7, 10, 15, 20];
 * const result = findLargestIdxLte(arr, 8);
 * console.log(result); // Output: 3 (since arr[3] is 7).
 */
const findLargestIdxLte = (data: number[], x: number): Nullable<number> => {
    const {length} = data;

    if (0 === length) {
        return null;
    }

    // Binary search to find the first index where data[i] > x.
    const firstGreaterIdx: number = binarySearch(length, (i) => data[i] as number > x);

    if (0 === firstGreaterIdx) {
        return 0;
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


export {
    findLargestIdxLte,
    getMapKeyByValue,
    getMapValueWithNearestLessThanOrEqualKey,
    isWithinBounds,
};
