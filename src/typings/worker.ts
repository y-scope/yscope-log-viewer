import {FILE_TYPE} from "../services/LogFileManager";
import {Nullable} from "./common";
import {ActiveLogCollectionEventIdx} from "./decoders";


/**
 * Type of input file, which can be either a URL string or a File object.
 */
type FileSrcType = string | File;

/**
 * For `CURSOR_CODE.PAGE_NUM`, this enum indicates which log event number (e.g., first/last on page)
 * should be returned with the page.
 */
enum EVENT_POSITION_ON_PAGE {
    TOP,
    BOTTOM,
}

/**
 * Enum of cursors used for locating some log event and navigating across pages.
 * - LAST_EVENT: the last event
 * - EVENT_NUM: a specific log event
 * - TIMESTAMP: the first event that has a timestamp >= the given value
 * - PAGE_NUM: the first or last event on the given page
 */
enum CURSOR_CODE {
    LAST_EVENT = "lastEvent",
    EVENT_NUM = "eventNum",
    TIMESTAMP = "timestamp",
    PAGE_NUM = "pageNum",
}

type CursorArgMap = {
    [CURSOR_CODE.LAST_EVENT]: null;
    [CURSOR_CODE.EVENT_NUM]: {
        eventNum: number;
    };
    [CURSOR_CODE.TIMESTAMP]: {
        timestamp: number;
    };
    [CURSOR_CODE.PAGE_NUM]: {
        pageNum: number;
        eventPositionOnPage: EVENT_POSITION_ON_PAGE;
    };
};

type CursorType = {
    [T in keyof CursorArgMap]: {
        code: T;
        args: CursorArgMap[T];
    };
}[keyof CursorArgMap];

/**
 * Active log collection indices for:
 * - the range [begin, end) of the page containing the matching log event.
 * - the log event that matches the cursor.
 */
type CursorData = {
    pageBegin: ActiveLogCollectionEventIdx;
    pageEnd: ActiveLogCollectionEventIdx;
    matchingEvent: ActiveLogCollectionEventIdx;
};

/**
 * Type mapping the first line number of each log event to the log event number.
 */
type BeginLineNumToLogEventNumMap = Map<number, number>;

type LogFileInfo = {
    fileName: string;
    fileType: FILE_TYPE;
    numEvents: number;
    onDiskFileSizeInBytes: number;
};

type PageData = {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    cursorLineNum: number;
    logEventNum: Nullable<number>;
    logs: string;
    numPages: number;
    pageNum: number;
};

/**
 * Empty page response.
 */
const EMPTY_PAGE_RESP: PageData = Object.freeze({
    beginLineNumToLogEventNum: new Map(),
    cursorLineNum: 1,
    logEventNum: null,
    logs: "",
    numPages: 1,
    pageNum: 1,
});

export {
    CURSOR_CODE,
    EMPTY_PAGE_RESP,
    EVENT_POSITION_ON_PAGE,
};
export type {
    BeginLineNumToLogEventNumMap,
    CursorData,
    CursorType,
    FileSrcType,
    LogFileInfo,
    PageData,
};
