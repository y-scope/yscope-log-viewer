import {
    FileSrcType,
    LOG_EVENT_ANCHOR,
} from "../../typings/worker";
import {getUint8ArrayFrom} from "../../utils/http";
import {
    clamp,
    getChunkNum,
} from "../../utils/math";
import {getBasenameFromUrlOrDefault} from "../../utils/url";


/**
 * Gets the range of log events to decode based on beginning log event index.
 *
 * @param numEvents
 * @param beginLogEventIdx
 * @param pageSize
 * @return Array with beginning log event number and ending log event number.
 */
const getRange = (
    numEvents: number,
    beginLogEventIdx: number,
    pageSize: number
): [number, number] => {
    const beginLogEventNum: number = beginLogEventIdx + 1;

    // Clamp ending index using total number of events.
    const endLogEventNum: number = Math.min(numEvents, beginLogEventNum + pageSize - 1);

    return [
        beginLogEventNum,
        endLogEventNum,
    ];
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

/**
 * Gets range and new log event number using page number cursor
 *
 * @param pageNum
 * @param logEventAnchor
 * @param numEvents
 * @param pageSize
 * @return An object containing the range and the new log event number.
 */
const getPageNumCursorData = (
    pageNum: number,
    logEventAnchor: LOG_EVENT_ANCHOR,
    numEvents: number,
    pageSize: number
): { beginLogEventNum: number; endLogEventNum: number; newLogEventNum: number } => {
    const beginLogEventIdx = (pageNum - 1) * pageSize;
    const [beginLogEventNum, endLogEventNum] = getRange(numEvents, beginLogEventIdx, pageSize);
    const newLogEventNum = logEventAnchor === LOG_EVENT_ANCHOR.FIRST ?
        beginLogEventNum :
        endLogEventNum;

    return {beginLogEventNum, endLogEventNum, newLogEventNum};
};

/**
 * Gets range and new log event number using event number cursor.
 *
 * @param logEventNum
 * @param numEvents
 * @param pageSize
 * @return An object containing the range and the new log event number.
 */
const getEventNumCursorData = (
    logEventNum: number,
    numEvents: number,
    pageSize: number
): { beginLogEventNum: number; endLogEventNum: number; newLogEventNum: number } => {
    const validLogEventNum = clamp(logEventNum, 1, numEvents);
    const beginLogEventIdx = (getChunkNum(validLogEventNum, pageSize) - 1) * pageSize;
    const [beginLogEventNum, endLogEventNum] = getRange(numEvents, beginLogEventIdx, pageSize);
    const newLogEventNum: number = validLogEventNum;
    return {beginLogEventNum, endLogEventNum, newLogEventNum};
};

/**
 * Gets range and new log event number using last event cursor.
 *
 * @param numEvents
 * @param pageSize
 * @return An object containing the range and the new log event number.
 */
const getLastEventCursorData = (
    numEvents: number,
    pageSize: number
): { beginLogEventNum: number; endLogEventNum: number; newLogEventNum: number } => {
    const beginLogEventIdx = (getChunkNum(numEvents, pageSize) - 1) * pageSize;
    const [beginLogEventNum, endLogEventNum] = getRange(numEvents, beginLogEventIdx, pageSize);
    const newLogEventNum: number = endLogEventNum;
    return {beginLogEventNum, endLogEventNum, newLogEventNum};
};

export {
    getEventNumCursorData,
    getLastEventCursorData,
    getPageNumCursorData,
    loadFile,
};
