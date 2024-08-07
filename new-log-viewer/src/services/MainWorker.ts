import dayjs from "dayjs";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsUtc from "dayjs/plugin/utc";

import {LOG_LEVEL} from "../typings/logs";
import {
    MainWorkerReqMessage,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerResp,
} from "../typings/worker";
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

onmessage = async (ev: MessageEvent<MainWorkerReqMessage>) => {
    const {code, args} = ev.data;
    console.log(`[Renderer -> MainWorker] code=${code}: args=${JSON.stringify(args)}`);

    try {
        switch (code) {
            case WORKER_REQ_CODE.LOAD_FILE: {
                LOG_FILE_MANAGER = await LogFileManager.create(
                    args.fileSrc,
                    args.pageSize,
                    args.decoderOptions
                );

                postResp(
                    WORKER_RESP_CODE.NUM_EVENTS,
                    {numEvents: LOG_FILE_MANAGER.numEvents}
                );
                postResp(
                    WORKER_RESP_CODE.PAGE_DATA,
                    LOG_FILE_MANAGER.loadPage(args.cursor)
                );
                break;
            }
            case WORKER_REQ_CODE.LOAD_PAGE:
                if (null === LOG_FILE_MANAGER) {
                    throw new Error("Log file manager is not initialized");
                }
                if ("undefined" !== typeof args.decoderOptions) {
                    LOG_FILE_MANAGER.setDecoderOptions(args.decoderOptions);
                }
                postResp(
                    WORKER_RESP_CODE.PAGE_DATA,
                    LOG_FILE_MANAGER.loadPage(args.cursor)
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
