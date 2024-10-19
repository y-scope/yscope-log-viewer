import {Nullable} from "./common";
import {
    ActiveLogCollectionEventIdx,
    DecoderOptionsType,
} from "./decoders";
import {
    LOG_LEVEL,
    LogLevelFilter,
} from "./logs";


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
    PAGE_NUM = "pageNum"
}

type CursorArgMap = {
    [CURSOR_CODE.LAST_EVENT]: null;
    [CURSOR_CODE.EVENT_NUM]: { eventNum: number };
    [CURSOR_CODE.TIMESTAMP]: { timestamp: number };
    [CURSOR_CODE.PAGE_NUM]: { pageNum: number, eventPositionOnPage: EVENT_POSITION_ON_PAGE };
};

type CursorType = {
    [T in keyof CursorArgMap]: { code: T, args: CursorArgMap[T] };
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

/**
 * Enum of the protocol code for communications between the renderer and MainWorker.
 */
enum WORKER_REQ_CODE {
    EXPORT_LOG = "exportLog",
    LOAD_FILE = "loadFile",
    LOAD_PAGE = "loadPage",
    SET_FILTER = "setFilter",
    START_QUERY = "startQuery",
}

enum WORKER_RESP_CODE {
    CHUNK_DATA = "chunkData",
    LOG_FILE_INFO = "fileInfo",
    NOTIFICATION = "notification",
    PAGE_DATA = "pageData",
    QUERY_RESULT = "queryResult",
}

type WorkerReqMap = {
    [WORKER_REQ_CODE.EXPORT_LOG]: null
    [WORKER_REQ_CODE.LOAD_FILE]: {
        fileSrc: FileSrcType,
        pageSize: number,
        cursor: CursorType,
        decoderOptions: DecoderOptionsType
    },
    [WORKER_REQ_CODE.LOAD_PAGE]: {
        cursor: CursorType,
    },
    [WORKER_REQ_CODE.SET_FILTER]: {
        cursor: CursorType,
        logLevelFilter: LogLevelFilter,
    },
    [WORKER_REQ_CODE.START_QUERY]: {
        queryString: string,
        isRegex: boolean,
        isCaseSensitive: boolean,
    },
};

type TextRange = [number, number];

interface QueryResultsType {
    logEventNum: number;
    message: string;
    matchRange: TextRange;
}

type QueryResults = Map<number, QueryResultsType[]>;

type WorkerRespMap = {
    [WORKER_RESP_CODE.CHUNK_DATA]: {
        logs: string
    },
    [WORKER_RESP_CODE.LOG_FILE_INFO]: {
        fileName: string,
        numEvents: number,
        onDiskFileSizeInBytes: number,
    },
    [WORKER_RESP_CODE.NOTIFICATION]: {
        logLevel: LOG_LEVEL,
        message: string,
    },
    [WORKER_RESP_CODE.PAGE_DATA]: {
        beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
        cursorLineNum: number,
        logEventNum: Nullable<number>,
        logs: string,
        numPages: number,
        pageNum: number,
    },
    [WORKER_RESP_CODE.QUERY_RESULT]: { results: QueryResults },
};

type WorkerReq<T extends WORKER_REQ_CODE> = T extends keyof WorkerReqMap ?
    WorkerReqMap[T] :
    never;

type WorkerResp<T extends WORKER_RESP_CODE> = T extends keyof WorkerRespMap ?
    WorkerRespMap[T] :
    never;

type MainWorkerReqMessage = {
    [T in keyof WorkerReqMap]: { code: T, args: WorkerReqMap[T] };
}[keyof WorkerReqMap];

type MainWorkerRespMessage = {
    [T in keyof WorkerRespMap]: { code: T, args: WorkerRespMap[T] };
}[keyof WorkerRespMap];

/**
 * Empty page response.
 */
const EMPTY_PAGE_RESP: WorkerResp<WORKER_RESP_CODE.PAGE_DATA> = Object.freeze({
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
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
};
export type {
    BeginLineNumToLogEventNumMap,
    CursorData,
    CursorType,
    FileSrcType,
    MainWorkerReqMessage,
    MainWorkerRespMessage,
    QueryResults,
    WorkerReq,
    WorkerResp,
};
