import dayjs from "dayjs";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsUtc from "dayjs/plugin/utc";

import {LOG_LEVEL} from "../typings/logs";
import {
    ChunkResults,
    MainWorkerReqMessage,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerResp,
} from "../typings/worker";
import {EXPORT_LOGS_CHUNK_SIZE} from "../utils/config";
import LogFileManager from "./LogFileManager";


/* eslint-disable import/no-named-as-default-member */
dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);
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
 * Post a response of a query chunk.
 *
 * @param chunkResults
 */
const handleChunkResult = (chunkResults: ChunkResults) => {
    postResp(WORKER_RESP_CODE.CHUNK_RESULT, chunkResults);
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
                if ("undefined" !== typeof args.decoderOptions) {
                    LOG_FILE_MANAGER.setDecoderOptions(args.decoderOptions);
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
                    handleChunkResult
                );

                postResp(WORKER_RESP_CODE.LOG_FILE_INFO, {
                    fileName: LOG_FILE_MANAGER.fileName,
                    numEvents: LOG_FILE_MANAGER.numEvents,
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
                if ("undefined" !== typeof args.decoderOptions) {
                    LOG_FILE_MANAGER.setDecoderOptions(args.decoderOptions);
                }
                postResp(
                    WORKER_RESP_CODE.PAGE_DATA,
                    LOG_FILE_MANAGER.loadPage(args.cursor)
                );
                break;
            case WORKER_REQ_CODE.QUERY_LOG:
                if (null === LOG_FILE_MANAGER) {
                    throw new Error("Log file manager hasn't been initialized");
                }
                LOG_FILE_MANAGER.startQuery(
                    args.searchString,
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
