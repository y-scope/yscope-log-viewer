import dayjs from "dayjs";
import dayjsBigIntSupport from "dayjs/plugin/bigIntSupport";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsUtc from "dayjs/plugin/utc";

import {LOG_LEVEL} from "../typings/logs";
import {
    MainWorkerReqMessage,
    QueryResults,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerResp,
} from "../typings/worker";
import {EXPORT_LOGS_CHUNK_SIZE} from "../utils/config";
import LogFileManager from "./LogFileManager";


/* eslint-disable import/no-named-as-default-member */
dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);
dayjs.extend(dayjsBigIntSupport);
/* eslint-enable import/no-named-as-default-member */

/**
 * Manager for the currently opened log file.
 */
let LOG_FILE_MANAGER : null | LogFileManager = null;

/**
 * Sends a response to the renderer.
 *
 * @param code
 * @param args
 */
const postResp = <T extends WORKER_RESP_CODE>(
    code: T,
    args: WorkerResp<T>
) => {
    postMessage({code, args});
};


/**
 * Post a response for a chunk of query results.
 *
 * @param queryProgress
 * @param queryResults
 */
const onQueryResults = (queryProgress: number, queryResults: QueryResults) => {
    postResp(WORKER_RESP_CODE.QUERY_RESULT, {progress: queryProgress, results: queryResults});
};

/**
 * Sends a message to the renderer to open a pop-up which prompts user to replace the default
 * format string.
 */
const postFormatPopup = () => {
    postResp(WORKER_RESP_CODE.FORMAT_POPUP, null);
};

// eslint-disable-next-line no-warning-comments
// TODO: Break this function up into smaller functions.
// eslint-disable-next-line max-lines-per-function,max-statements
onmessage = async (ev: MessageEvent<MainWorkerReqMessage>) => {
    const {code, args} = ev.data;
    console.log(`[Renderer -> MainWorker] code=${code}: args=${JSON.stringify(args)}`);

    try {
        switch (code) {
            case WORKER_REQ_CODE.EXPORT_LOG: {
                if (null === LOG_FILE_MANAGER) {
                    throw new Error("Log file manager hasn't been initialized");
                }
                let decodedEventIdx = 0;
                while (decodedEventIdx < LOG_FILE_MANAGER.numEvents) {
                    postResp(
                        WORKER_RESP_CODE.CHUNK_DATA,
                        LOG_FILE_MANAGER.loadChunk(decodedEventIdx)
                    );
                    decodedEventIdx += EXPORT_LOGS_CHUNK_SIZE;
                }
                break;
            }
            case WORKER_REQ_CODE.LOAD_FILE: {
                LOG_FILE_MANAGER = await LogFileManager.create(
                    args.fileSrc,
                    args.pageSize,
                    args.decoderOptions,
                    onQueryResults
                );

                postResp(WORKER_RESP_CODE.LOG_FILE_INFO, {
                    fileName: LOG_FILE_MANAGER.fileName,
                    numEvents: LOG_FILE_MANAGER.numEvents,
                    onDiskFileSizeInBytes: LOG_FILE_MANAGER.onDiskFileSizeInBytes,
                });
                postResp(
                    WORKER_RESP_CODE.PAGE_DATA,
                    LOG_FILE_MANAGER.loadPage(args.cursor)
                );
                break;
            }
            case WORKER_REQ_CODE.LOAD_PAGE:
                if (null === LOG_FILE_MANAGER) {
                    throw new Error("Log file manager hasn't been initialized");
                }
                postResp(
                    WORKER_RESP_CODE.PAGE_DATA,
                    LOG_FILE_MANAGER.loadPage(args.cursor)
                );
                break;
            case WORKER_REQ_CODE.SET_FILTER:
                if (null === LOG_FILE_MANAGER) {
                    throw new Error("Log file manager hasn't been initialized");
                }

                LOG_FILE_MANAGER.setLogLevelFilter(args.logLevelFilter);
                postResp(
                    WORKER_RESP_CODE.PAGE_DATA,
                    LOG_FILE_MANAGER.loadPage(args.cursor)
                );
                break;
            case WORKER_REQ_CODE.START_QUERY:
                if (null === LOG_FILE_MANAGER) {
                    throw new Error("Log file manager hasn't been initialized");
                }
                if (
                    "string" !== typeof args.queryString ||
                    "boolean" !== typeof args.isRegex ||
                    "boolean" !== typeof args.isCaseSensitive
                ) {
                    throw new Error("Invalid arguments for QUERY_LOG");
                }
                LOG_FILE_MANAGER.startQuery(
                    args.queryString,
                    args.isRegex,
                    args.isCaseSensitive
                );
                break;
            default:
                console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
                break;
        }
    } catch (e) {
        console.error(e);
        if (e instanceof Error) {
            postResp(WORKER_RESP_CODE.NOTIFICATION, {
                logLevel: LOG_LEVEL.ERROR,
                message: e.message,
            });
        } else {
            postResp(WORKER_RESP_CODE.NOTIFICATION, {
                logLevel: LOG_LEVEL.FATAL,
                message: "An error occurred in the worker that cannot be serialized. " +
                `Check the browser console for more details. Type: ${typeof e}`,
            });
        }
    }
};

export {postFormatPopup};
