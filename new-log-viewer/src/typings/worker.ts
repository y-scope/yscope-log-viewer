import {DecodeOptionsType} from "./decoders";


/**
 * Type of input file, which can be either a URL string or a File object.
 */
type FileSrcType = string | File;

/**
 * Type of cursor used for locating some log event and navigating across pages.
 * - null: the last event
 * - timestamp: the first event that has a timestamp >= the given value
 * - pageNum: the first event on the given page
 */
type CursorType = null | { timestamp: number } | { pageNum: number };

/**
 * Type mapping the first line number of each log event to the log event
 * number.
 */
type BeginLineNumToLogEventNumMap = Map<number, number>;

/**
 * Enum of the protocol code for communications between the renderer and MainWorker.
 */
enum WORKER_REQ_CODE {
    LOAD_FILE = "loadFile",
}

enum WORKER_RESP_CODE {
    PAGE_DATA = "pageData",
    NUM_EVENTS = "numEvents"
}

type WorkerReqMap = {
    [WORKER_REQ_CODE.LOAD_FILE]: {
        fileSrc: FileSrcType,
        pageSize: number,
        cursor: CursorType,
        decodeOptions: DecodeOptionsType
    };
};

type WorkerRespMap = {
    [WORKER_RESP_CODE.PAGE_DATA]: {
        logs: string,
        beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
        cursorLineNum: number
    };
    [WORKER_RESP_CODE.NUM_EVENTS]: {
        numEvents: number
    };
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
