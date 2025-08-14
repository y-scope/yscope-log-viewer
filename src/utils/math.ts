import {Nullable} from "../typings/common";


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

/**
 * Gets the chunk number that contains an item (assuming that item is in a collection and that
 * collection is divided into chunks of a given size).
 *
 * @param itemNum
 * @param chunkSize
 * @return The chunk number.
 */
const getChunkNum =
    (itemNum: number, chunkSize: number) => Math.max(1, Math.ceil(itemNum / chunkSize));

/**
 * Finds the last element in a sorted collection that is less than or equal to `upperBoundValue`. If
 * all elements in the collection are greater than `upperBoundValue`, returns the first index of the
 * collection (i.e., `0`).
 *
 * @param get Function to access an element (or its property) in the collection.
 * @param array
 * @param upperBoundValue
 * @return The index of the last element less than or equal to `upperBoundValue`, `0` if all
 * elements are greater, or `null` if the collection is empty or the indices are invalid.
 */
const upperBoundBinarySearch = <T, U>(
    get: (arrayElement: U) => T,
    array: U[],
    upperBoundValue: T,
): Nullable<number> => {
    if (0 === array.length) {
        return null;
    }
    let lowIdx = 0;
    let highIdx = array.length - 1;

    while (lowIdx <= highIdx) {
        const mid = Math.floor((lowIdx + highIdx) / 2);

        // `mid` is guaranteed to be within bounds since `lowIdx <= highIdx`.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (get(array[mid]!) <= upperBoundValue) {
            lowIdx = mid + 1;
        } else {
            highIdx = mid - 1;
        }
    }

    // corner case: all values >= upperboundValue
    if (0 > highIdx) {
        return 0;
    }

    return highIdx;
};

export {
    clamp,
    getChunkNum,
    upperBoundBinarySearch,
};
