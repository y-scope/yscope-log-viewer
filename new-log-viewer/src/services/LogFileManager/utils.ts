import {Nullable} from "../../typings/common";
import {FilteredLogEventMap} from "../../typings/decoders";
import {
    CursorData,
    EVENT_POSITION_ON_PAGE,
    FileSrcType,
} from "../../typings/worker";
import {
    clampWithinBounds,
    findNearestLessThanOrEqualElement,
} from "../../utils/data";
import {getUint8ArrayFrom} from "../../utils/http";
import {
    clamp,
    getChunkNum,
} from "../../utils/math";
import {getBasenameFromUrlOrDefault} from "../../utils/url";


/**
 * Gets the data for the `PAGE_NUM` cursor.
 *
 * @param pageNum
 * @param eventPositionOnPage
 * @param numEvents
 * @param pageSize
 * @return
 */
const getPageNumCursorData = (
    pageNum: number,
    eventPositionOnPage: EVENT_POSITION_ON_PAGE,
    numEvents: number,
    pageSize: number,
): CursorData => {
    const pageBeginIdx = (pageNum - 1) * pageSize;
    const pageEndIdx = Math.min(numEvents, pageBeginIdx + pageSize);

    const matchingIdx = eventPositionOnPage === EVENT_POSITION_ON_PAGE.TOP ?
        pageBeginIdx :
        pageEndIdx - 1;

    return {pageBeginIdx, pageEndIdx, matchingIdx};
};

/**
 * Converts a potentially "invalid" `logEventIdx` into a valid log event index. `logEventIdx` may
 * be "invalid" if:
 * - `logEventIdx >= numEvents`.
 * - `logEventIdx` excluded by the current filter.
 *
 * @param logEventIdx
 * @param numEvents
 * @param filteredLogEventMap
 * @return Valid index.
 */
const getValidLogEventIdx = (
    logEventIdx: number,
    numEvents: number,
    filteredLogEventMap: FilteredLogEventMap,
): number => {
    if (null === filteredLogEventMap) {
        // There is no filter applied.
        return clamp(logEventIdx, 1, numEvents - 1);
    }
    const clampedLogEventIdx = clampWithinBounds(filteredLogEventMap, logEventIdx);

    // Explicit cast since TypeScript thinks the return value can be null, but it can't be since
    // filteredLogEventMap is non-empty and `clampedLogEventIdx` is within the bounds of
    // `filteredLogEventMap`.
    return findNearestLessThanOrEqualElement(filteredLogEventMap, clampedLogEventIdx) as number;
};

/**
 * Gets the data for the `EVENT_NUM` cursor.
 *
 * @param logEventNum
 * @param numEvents
 * @param pageSize
 * @param filteredLogEventMap
 * @return
 */
const getEventNumCursorData = (
    logEventNum: Nullable<number>,
    numEvents: number,
    pageSize: number,
    filteredLogEventMap: FilteredLogEventMap
): CursorData => {
    const matchingIdx = getValidLogEventIdx((logEventNum ?? 1) - 1, numEvents, filteredLogEventMap);
    const pageBeginIdx = (getChunkNum(matchingIdx + 1, pageSize) - 1) * pageSize;
    const pageEndIdx = Math.min(numEvents, pageBeginIdx + pageSize);
    return {pageBeginIdx, pageEndIdx, matchingIdx};
};

/**
 * Gets the data for the `LAST` cursor.
 *
 * @param numEvents
 * @param pageSize
 * @return
 */
const getLastEventCursorData = (
    numEvents: number,
    pageSize: number
): CursorData => {
    const pageBeginIdx = (getChunkNum(numEvents, pageSize) - 1) * pageSize;
    const pageEndIdx = Math.min(numEvents, pageBeginIdx + pageSize);
    const matchingIdx: number = pageEndIdx - 1;
    return {pageBeginIdx, pageEndIdx, matchingIdx};
};

/**
 * Loads a file from a given source.
 *
 * @param fileSrc The source of the file to load. This can be a string representing a URL, or a File
 * object.
 * @return A promise that resolves with an object containing the file name and file data.
 * @throws {Error} If the file source type is not supported.
 */
const loadFile = async (fileSrc: FileSrcType)
    : Promise<{ fileName: string, fileData: Uint8Array }> => {
    let fileName: string;
    let fileData: Uint8Array;
    if ("string" === typeof fileSrc) {
        fileName = getBasenameFromUrlOrDefault(fileSrc);
        fileData = await getUint8ArrayFrom(fileSrc, () => null);
    } else {
        fileName = fileSrc.name;
        fileData = new Uint8Array(await fileSrc.arrayBuffer());
    }

    return {
        fileName,
        fileData,
    };
};

export {
    getEventNumCursorData,
    getLastEventCursorData,
    getPageNumCursorData,
    loadFile,
};
