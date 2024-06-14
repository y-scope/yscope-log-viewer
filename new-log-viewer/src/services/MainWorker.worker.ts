import {
    MainWorkerReqMessage,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerResp,
} from "../typings/worker";


/**
 * Sends a response message to the render.
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

onmessage = (ev: MessageEvent<MainWorkerReqMessage>) => {
    const {code, args} = ev.data;
    console.log(`[Render -> MainWorker] code=${code}: args=${JSON.stringify(args)}`);

    switch (code) {
        case WORKER_REQ_CODE.LOAD_FILE: {
            postResp(WORKER_RESP_CODE.PAGE_DATA, {
                logs: "Hello world!",
                lines: new Map([
                    // eslint-disable-next-line @stylistic/js/array-element-newline
                    [1, 1],
                ]),
                startLogEventNum: 1,
            });
            postResp(WORKER_RESP_CODE.NUM_EVENTS, {
                numEvents: 1,
            });
            break;
        }
        default:
            console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
            break;
    }
};

// This `new` (constructor definition) is needed to get worker-loader + TypeScript to work
declare const self: ServiceWorkerGlobalScope;
const ctx: Worker & { new (): Worker} = self as never;
export default ctx;
