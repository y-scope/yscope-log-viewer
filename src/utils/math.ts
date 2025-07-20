import {Nullable} from "../typings/common.ts";


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
 * Finds the index of the last element in a sorted collection that is less than or equal to
 * `upperboundValue`. If all elements in the collection are greater than `upperboundValue`, return
 * the first index of the collection (i.e., `0`).
 *
 * @param get
 * @param lowIdx
 * @param highIdx
 * @param upperboundValue
 * @return
 */
const upperBoundBinarySearch = <T>(
    get: (index: number) => T,
    lowIdx: number,
    highIdx: number,
    upperboundValue: T,
): Nullable<number> => {
    if (highIdx < lowIdx || "undefined" === typeof (get(highIdx))) {
        return null;
    }

    while (lowIdx <= highIdx) {
        const mid = Math.floor((lowIdx + highIdx) / 2);

        // `mid` is guaranteed to be within bounds since `low <= high`.
        if (get(mid) <= upperboundValue) {
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
