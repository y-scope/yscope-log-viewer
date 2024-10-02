import {Nullable} from "../typings/common";


/**
 * Performs binary search to find the smallest index `i` in the range [0, n) where the
 * `conditionFn` is true. Assumes that the `conditionFn` is false for some prefix of the
 * input range and true for the remainder. The most common use is find the index `i` of
 * a value x in a sorted array.
 *
 * @param n The length of the range to search.
 * @param conditionFn A function that takes an index and returns `true` or `false`.
 * @return The smallest index where `conditionFn(i)` is true. If no such index exists, returns `n`.
 * @example
 * const arr = [1, 3, 5, 7, 10, 15, 20];
 * const result = binarySearch(arr.length, (i) => arr[i] >= 10);
 * console.log(result); // Output: 4 (since arr[4] is 10).
 */
const binarySearch = (n: number, conditionFn: (index: number) => boolean): number => {
    // Generic implementation based on Go standard library implementation.
    // Reference: https://pkg.go.dev/sort#Search
    let i = 0;
    let j = n;

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

    if (0 === n) {
        return null;
    }

    // Binary search to find the first index where data[i] > x.
    const firstGreaterIdx: number = binarySearch(n, (i) => data[i] as number > x);

    if (0 === firstGreaterIdx) {
        return 0;
    }

    return firstGreaterIdx - 1;
};

/**
 * Finds the largest index `i` in a sorted array `data` such that `data[i] <= x`.
 * Uses binary search for efficiency. This method is strict in that it
 * returns `null` if `x` is less than `data[0]` or greater than `data[n-1]`.
 * i.e. it informs the caller if x is outside the bounds of `data`.
 *
 * @param data Sorted array.
 * @param x Target value.
 * @return The largest index where `data[i] <= x`. Returns `null` in the following cases:
 * - `x` is less than `data[0]`.
 * - `x` is greater than `data[n-1]`.
 * - The array is empty.
 * @example
 * const arr = [2, 3, 5, 7, 10, 15, 20];
 * const result = strictFindLargestIdxLte(arr, 8);
 * console.log(result); // Output: 3 (since arr[3] is 7).
 */
const strictFindLargestIdxLte = (data: number[], x: number): Nullable<number> => {
    const n = data.length;

    if (0 === n) {
        return null;
    }

    // Binary search to find the first index where data[i] > x.
    const firstGreaterIdx: number = binarySearch(n, (i) => data[i] as number > x);

    if (0 === firstGreaterIdx) {
        return null;
    }

    const valueAtLastIndex: number = data[n - 1] as number;
    if (firstGreaterIdx === n && valueAtLastIndex !== x) {
        // Return null if x is greater than the highest value in the array.
        return null;
    }

    return firstGreaterIdx - 1;
};

export {
    findLargestIdxLte,
    strictFindLargestIdxLte,
};
