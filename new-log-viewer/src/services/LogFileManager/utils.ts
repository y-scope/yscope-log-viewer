import {Nullable} from "../../typings/common";
import {FilteredLogEventMap} from "../../typings/decoders";
import {
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
 * @return Log event numbers for:
 * - the range [begin, end) of page `pageNum`.
 * - the log event indicated by `eventPositionOnPage`.
 */
const getPageNumCursorData = (
    pageNum: number,
    eventPositionOnPage: EVENT_POSITION_ON_PAGE,
    numEvents: number,
    pageSize: number,
): { pageBeginIdx: number; pageEndIdx: number; matchingIdx: number } => {
    const pageBeginIdx = (pageNum - 1) * pageSize;
    const pageEndIdx = Math.min(numEvents, pageBeginIdx + pageSize);

    const matchingIdx = eventPositionOnPage === EVENT_POSITION_ON_PAGE.TOP ?
        pageBeginIdx :
        pageEndIdx - 1;

    return {pageBeginIdx, pageEndIdx, matchingIdx};
};

/**
 * Gets a valid log event number. This function is required as input `logEventNum` may be "invalid"
 * if:
 * - `logEventNum >= numEvents`.
 * - `logEventNum` excluded by the current filter.
 * If the input is "invalid", the function returns the nearest log event number in place of
 * `logEventNum`.
 *
 * @param logEventNum
 * @param numEvents
 * @param filteredLogEventMap
 * @return Valid index.
 */
const getValidLogEventIdx = (
    logEventNum: Nullable<number>,
    numEvents: number,
    filteredLogEventMap: FilteredLogEventMap,
): number => {
    const eventNum = logEventNum ?? 1;
    if (null === filteredLogEventMap) {
        // There is no filter applied.
        return clamp(eventNum, 1, numEvents) - 1;
    }
    const clampedLogEventIdx = clampWithinBounds(filteredLogEventMap, eventNum - 1);

    // Explicit cast since typescript thinks `filteredLogEventIdx` can be null, but it can't
    // since filteredLogEventMap has a length >= 1 and the input is clamped within the bounds
    // of the array.
    return findNearestLessThanOrEqualElement(filteredLogEventMap, clampedLogEventIdx) as number;
};

/**
 * Gets the data for the `EVENT_NUM` cursor.
 *
 * @param logEventNum
 * @param numEvents
 * @param pageSize
 * @param filteredLogEventMap
 * @return Indexes for:
 * - the range [begin, end) of the page containing `logEventNum`.
 * - log event `logEventNum`.
 */
const getEventNumCursorData = (
    logEventNum: Nullable<number>,
    numEvents: number,
    pageSize: number,
    filteredLogEventMap: FilteredLogEventMap
): { pageBeginIdx: number; pageEndIdx: number; matchingIdx: number } => {
    const matchingIdx = getValidLogEventIdx(logEventNum, numEvents, filteredLogEventMap);
    const pageBeginIdx = (getChunkNum(matchingIdx + 1, pageSize) - 1) * pageSize;
    const pageEndIdx = Math.min(numEvents, pageBeginIdx + pageSize);
    return {pageBeginIdx, pageEndIdx, matchingIdx};
};

/**
 * Gets the data for the `LAST` cursor.
 *
 * @param numEvents
 * @param pageSize
 * @return Indexes for:
 * - the range [begin, end) of the last page.
 * - the last log event on the last page.
 */
const getLastEventCursorData = (
    numEvents: number,
    pageSize: number
): { pageBeginIdx: number; pageEndIdx: number; matchingIdx: number } => {
    const pageBeginIdx = (getChunkNum(numEvents, pageSize) - 1) * pageSize;
    const pageEndIdx = Math.min(numEvents, pageBeginIdx + pageSize);
    const matchingIdx: number = pageEndIdx - 1;
    return {pageBeginIdx, pageEndIdx, matchingIdx};
};

/**
 * Converts the matching index into log event number.
 *
 * @param matchingIdx
 * @param filteredLogEventMap
 * @return Log event number.
 */
const getMatchingLogEventNum = (
    matchingIdx: Nullable<number>,
    filteredLogEventMap: FilteredLogEventMap,
): number => {
    if (null === matchingIdx) {
        return 0;
    }

    return null !== filteredLogEventMap ?

        // Explicit cast since typescript thinks `filteredLogEventMap[matchingIdx]` can be
        // undefined, but it can't since filteredLogEventMap has a length >= 1.
        (filteredLogEventMap[matchingIdx] as number) + 1 :
        matchingIdx + 1;
};


/**
 * Gets the new number of pages.
 *
 * @param numEvents
 * @param pageSize
 * @param filteredLogEventMap
 * @return Page count.
 */
const getNewNumPages = (
    numEvents: number,
    pageSize: number,
    filteredLogEventMap: FilteredLogEventMap,
): number => {
    const numActiveEvents: number = filteredLogEventMap ?
        filteredLogEventMap.length :
        numEvents;

    return getChunkNum(numActiveEvents, pageSize);
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
    getMatchingLogEventNum,
    getNewNumPages,
    getPageNumCursorData,
    loadFile,
};
