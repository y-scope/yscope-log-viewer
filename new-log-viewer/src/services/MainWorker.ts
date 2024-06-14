import {
    MainWorkerReqMessage,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerResp,
} from "../typings/worker";


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

onmessage = (ev: MessageEvent<MainWorkerReqMessage>) => {
    const {code, args} = ev.data;
    console.log(`[Renderer -> MainWorker] code=${code}: args=${JSON.stringify(args)}`);

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
