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
 * Calculates the last item number in the previous chunk.
 *
 * @param itemNum
 * @param chunkSize
 * @return The last item number in the previous chunk.
 */
const getLastItemNumInPrevChunk = (itemNum: number, chunkSize: number) => (
    (
        getChunkNum(itemNum - chunkSize, chunkSize)
    ) * chunkSize
);

/**
 * Calculates the last item number in the previous chunk.
 *
 * @param itemNum
 * @param chunkSize
 * @return The last item number in the previous chunk.
 */
const getNextItemNumInNextChunk = (itemNum: number, chunkSize: number) => (
    ((
        getChunkNum(itemNum + chunkSize, chunkSize) - 1
    ) * chunkSize) + 1
);


export {
    clamp,
    getChunkNum,
    getLastItemNumInPrevChunk,
    getNextItemNumInNextChunk,
};
