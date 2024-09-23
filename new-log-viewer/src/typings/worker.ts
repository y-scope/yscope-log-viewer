import {DecoderOptionsType} from "./decoders";
import {LOG_LEVEL} from "./logs";


/**
 * Type of input file, which can be either a URL string or a File object.
 */
type FileSrcType = string | File;

/**
 * Enum of cursors used for locating some log event and navigating across pages.
 * - LAST_EVENT: the last event
 * - TIMESTAMP: the first event that has a timestamp >= the given value
 * - PAGE_NUM: the first event on the given page
 */
enum CURSOR_CODE {
    LAST_EVENT = "lastEvent",
    TIMESTAMP = "timestamp",
    PAGE_NUM = "pageNum"
}

type CursorArgMap = {
    [CURSOR_CODE.LAST_EVENT]: null;
    [CURSOR_CODE.TIMESTAMP]: { timestamp: number };
    [CURSOR_CODE.PAGE_NUM]: { pageNum: number };
};

type CursorType = {
    [T in keyof CursorArgMap]: { code: T, args: CursorArgMap[T] };
}[keyof CursorArgMap];

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
    QUERY_LOG = "queryLog",
}

enum WORKER_RESP_CODE {
    CHUNK_DATA = "chunkData",
    LOG_FILE_INFO = "fileInfo",
    NOTIFICATION = "notification",
    PAGE_DATA = "pageData",
    QUERY_RESULT = "queryResult",
}

type WorkerReqMap = {
    [WORKER_REQ_CODE.EXPORT_LOG]: {
        decoderOptions: DecoderOptionsType
    }
    [WORKER_REQ_CODE.LOAD_FILE]: {
        fileSrc: FileSrcType,
        pageSize: number,
        cursor: CursorType,
        decoderOptions: DecoderOptionsType
    },
    [WORKER_REQ_CODE.LOAD_PAGE]: {
        cursor: CursorType,
        decoderOptions?: DecoderOptionsType
    },
    [WORKER_REQ_CODE.QUERY_LOG]: {
        searchString: string,
        isRegex: boolean,
        matchCase: boolean,
    }
};

type WorkerRespMap = {
    [WORKER_RESP_CODE.CHUNK_DATA]: {
        logs: string
    },
    [WORKER_RESP_CODE.LOG_FILE_INFO]: {
        fileName: string,
        numEvents: number,
    },
    [WORKER_RESP_CODE.NOTIFICATION]: {
        logLevel: LOG_LEVEL,
        message: string
    },
    [WORKER_RESP_CODE.PAGE_DATA]: {
        logs: string,
        beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
        cursorLineNum: number
    },
    [WORKER_RESP_CODE.QUERY_RESULT]: {
        [lineNum: number]: {
            logEventNum: number;
            message: string;
            matchRange: [number, number];
        };
    }
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

export {
    CURSOR_CODE,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
};
export type {
    BeginLineNumToLogEventNumMap,
    CursorType,
    FileSrcType,
    MainWorkerReqMessage,
    MainWorkerRespMessage,
    WorkerReq,
    WorkerResp,
};
