import {
    ActiveLogCollectionEventIdx,
    FilteredLogEventMap,
} from "../../typings/decoders";
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
 * @param numActiveEvents
 * @param pageSize
 * @return
 */
const getPageNumCursorData = (
    pageNum: number,
    eventPositionOnPage: EVENT_POSITION_ON_PAGE,
    numActiveEvents: number,
    pageSize: number,
): CursorData => {
    const pageBegin: ActiveLogCollectionEventIdx = (pageNum - 1) * pageSize;
    const pageEnd: ActiveLogCollectionEventIdx = Math.min(numActiveEvents, pageBegin + pageSize);

    const matchingEvent: ActiveLogCollectionEventIdx =
        eventPositionOnPage === EVENT_POSITION_ON_PAGE.TOP ?
            pageBegin :
            pageEnd - 1;

    return {pageBegin, pageEnd, matchingEvent};
};

/**
 * Gets the `ActiveLogCollectionEventIdx` that's nearest to `logEventIdx`. Specifically:
 * - If no filter is set, the nearest `ActiveLogCollectionEventIdx` is:
 *   - `logEventIdx` if it's in the range of the unfiltered log events collection.
 *   - the bound of the collection nearest to `logEventIdx` if it's not in the collection's range.
 * - If a filter is set, the nearest `ActiveLogCollectionEventIdx` is:
 *   - the largest index, `i`, where `filteredLogEventMap[i] <= logEventIdx`; or
 *   - `0` if `logEventIdx < filteredLogEventMap[0]`.
 *
 * @param logEventIdx
 * @param numActiveEvents
 * @param filteredLogEventMap
 * @return
 */
const getNearestActiveLogCollectionEventIdx = (
    logEventIdx: number,
    numActiveEvents: number,
    filteredLogEventMap: FilteredLogEventMap,
): ActiveLogCollectionEventIdx => {
    if (null === filteredLogEventMap) {
        return clamp(logEventIdx, 0, numActiveEvents - 1);
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
 * @param numActiveEvents
 * @param pageSize
 * @param filteredLogEventMap
 * @return
 */
const getEventNumCursorData = (
    logEventNum: number,
    numActiveEvents: number,
    pageSize: number,
    filteredLogEventMap: FilteredLogEventMap
): CursorData => {
    const matchingEvent: ActiveLogCollectionEventIdx =
        getNearestActiveLogCollectionEventIdx(
            logEventNum - 1,
            numActiveEvents,
            filteredLogEventMap
        );
    const pageBegin: ActiveLogCollectionEventIdx =
        (getChunkNum(matchingEvent + 1, pageSize) - 1) * pageSize;
    const pageEnd: ActiveLogCollectionEventIdx =
        Math.min(numActiveEvents, pageBegin + pageSize);

    return {pageBegin, pageEnd, matchingEvent};
};

/**
 * Gets the data for the `LAST` cursor.
 *
 * @param numActiveEvents
 * @param pageSize
 * @return
 */
const getLastEventCursorData = (
    numActiveEvents: number,
    pageSize: number
): CursorData => {
    const pageBegin: ActiveLogCollectionEventIdx =
        (getChunkNum(numActiveEvents, pageSize) - 1) * pageSize;
    const pageEnd: ActiveLogCollectionEventIdx = Math.min(numActiveEvents, pageBegin + pageSize);
    const matchingEvent: ActiveLogCollectionEventIdx = pageEnd - 1;
    return {pageBegin, pageEnd, matchingEvent};
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
