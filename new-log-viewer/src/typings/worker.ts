/**
 * Enum of the protocol code for communications between the client and CLP worker.
 */
enum WORKER_PROTOCOL_REQ {
    LOAD_FILE = "loadFile",
}

enum WORKER_PROTOCOL_RESP {
    PAGE_DATA = "pageData",
    NUM_EVENTS = "numEvents"
}

type FileSrcType = string | File;
type CursorType = null | { timestamp: number } | { pageNum: number };
type LineNumLogEventIdxMap = Map<number, number>;

type WorkerRequestMap = {
    [WORKER_PROTOCOL_REQ.LOAD_FILE]: {
        fileSrc: FileSrcType,
        pageSize: number,
        cursor: CursorType,
    };
};

type WorkerRespMap = {
    [WORKER_PROTOCOL_RESP.PAGE_DATA]: {
        logs: string,
        lines: LineNumLogEventIdxMap,
        startLogEventNum: number
    };
    [WORKER_PROTOCOL_RESP.NUM_EVENTS]: {
        numEvents: number
    };
};

type WorkerRequest<T extends WORKER_PROTOCOL_REQ> = T extends keyof WorkerRequestMap ?
    WorkerRequestMap[T] :
    never;

type WorkerResponse<T extends WORKER_PROTOCOL_RESP> = T extends keyof WorkerRespMap ?
    WorkerRespMap[T] :
    never;

type MainWorkerReqMessage = {
    [T in keyof WorkerRequestMap]: { code: T, args: WorkerRequestMap[T] };
}[keyof WorkerRequestMap];

type MainWorkerRespMessage = {
    [T in keyof WorkerRespMap]: { code: T, args: WorkerRespMap[T] };
}[keyof WorkerRespMap];

export {
    WORKER_PROTOCOL_REQ,
    WORKER_PROTOCOL_RESP,
};
export type {
    FileSrcType,
    LineNumLogEventIdxMap,
    MainWorkerReqMessage,
    MainWorkerRespMessage,
    WorkerRequest,
    WorkerResponse,
};
