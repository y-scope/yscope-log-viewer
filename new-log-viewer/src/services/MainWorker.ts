import dayjs from "dayjs";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsUtc from "dayjs/plugin/utc";

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
 * Manages log files for the application.
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

    switch (code) {
        case WORKER_REQ_CODE.LOAD_FILE: {
            LOG_FILE_MANAGER = new LogFileManager(args.pageSize);
            const numEvents = await LOG_FILE_MANAGER.loadFile(args.fileSrc);

            postResp(
                WORKER_RESP_CODE.NUM_EVENTS,
                {numEvents}
            );
            postResp(
                WORKER_RESP_CODE.PAGE_DATA,
                LOG_FILE_MANAGER.loadPage(args.cursor)
            );
            break;
        }
        default:
            console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
            break;
    }
};
