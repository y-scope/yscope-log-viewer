import {
    EVENT_POSITION_ON_PAGE,
    FileSrcType,
} from "../../typings/worker";
import {getUint8ArrayFrom} from "../../utils/http";
import {
    clamp,
    getChunkNum,
} from "../../utils/math";
import {getBasenameFromUrlOrDefault} from "../../utils/url";


/**
 * Gets the log event number range [begin, end) of the page that starts at the given log event
 * index.
 *
 * @param beginLogEventIdx
 * @param numEvents
 * @param pageSize
 * @return An array:
 * - pageBeginLogEventNum
 * - pageEndLogEventNum
 */
const getPageBoundaries = (
    beginLogEventIdx: number,
    numEvents: number,
    pageSize: number
): [number, number] => {
    const pageBeginLogEventNum: number = beginLogEventIdx + 1;

    // Clamp ending index using total number of events.
    const pageEndLogEventNum: number = Math.min(numEvents + 1, pageBeginLogEventNum + pageSize);

    return [
        pageBeginLogEventNum,
        pageEndLogEventNum,
    ];
};

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
    pageSize: number
): { pageBeginLogEventNum: number; pageEndLogEventNum: number; matchingLogEventNum: number } => {
    const beginLogEventIdx = (pageNum - 1) * pageSize;
    const [pageBeginLogEventNum, pageEndLogEventNum] = getPageBoundaries(
        beginLogEventIdx,
        numEvents,
        pageSize
    );
    const matchingLogEventNum = eventPositionOnPage === EVENT_POSITION_ON_PAGE.TOP ?
        pageBeginLogEventNum :
        pageEndLogEventNum - 1;

    return {pageBeginLogEventNum, pageEndLogEventNum, matchingLogEventNum};
};

/**
 * Gets the data for the `EVENT_NUM` cursor.
 *
 * @param logEventNum
 * @param numEvents
 * @param pageSize
 * @return Log event numbers for:
 * - the range [begin, end) of the page containing `logEventNum`.
 * - log event `logEventNum`.
 */
const getEventNumCursorData = (
    logEventNum: number,
    numEvents: number,
    pageSize: number
): { pageBeginLogEventNum: number; pageEndLogEventNum: number; matchingLogEventNum: number } => {
    const validLogEventNum = clamp(logEventNum, 1, numEvents);
    const beginLogEventIdx = (getChunkNum(validLogEventNum, pageSize) - 1) * pageSize;
    const [pageBeginLogEventNum, pageEndLogEventNum] = getPageBoundaries(
        beginLogEventIdx,
        numEvents,
        pageSize
    );
    const matchingLogEventNum: number = validLogEventNum;
    return {pageBeginLogEventNum, pageEndLogEventNum, matchingLogEventNum};
};

/**
 * Gets the data for the `LAST` cursor.
 *
 * @param numEvents
 * @param pageSize
 * @return Log event numbers for:
 * - the range [begin, end) of the last page.
 * - the last log event on the last page.
 */
const getLastEventCursorData = (
    numEvents: number,
    pageSize: number
): { pageBeginLogEventNum: number; pageEndLogEventNum: number; matchingLogEventNum: number } => {
    const beginLogEventIdx = (getChunkNum(numEvents, pageSize) - 1) * pageSize;
    const [pageBeginLogEventNum, pageEndLogEventNum] = getPageBoundaries(
        beginLogEventIdx,
        numEvents,
        pageSize
    );
    const matchingLogEventNum: number = pageEndLogEventNum - 1;
    return {pageBeginLogEventNum, pageEndLogEventNum, matchingLogEventNum};
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
