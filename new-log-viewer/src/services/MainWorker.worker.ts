import {
    MainWorkerReqMessage,
    WORKER_PROTOCOL_REQ,
    WORKER_PROTOCOL_RESP,
} from "../typings/worker";


onmessage = (ev: MessageEvent<MainWorkerReqMessage>) => {
    const {code, args} = ev.data;
    console.log(`[Render -> MainWorker] code=${code}: args=${JSON.stringify(args)}`);

    switch (code) {
        case WORKER_PROTOCOL_REQ.LOAD_FILE: {
            postMessage({
                code: WORKER_PROTOCOL_RESP.PAGE_DATA,
                args: {
                    logs: "Hello world!",
                    lines: [1],
                    startLogEventNum: 1,
                },
            });
            postMessage({
                code: WORKER_PROTOCOL_RESP.NUM_EVENTS,
                args: {
                    numEvents: 1,
                },
            });
            break;
        }
        default:
            console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
            break;
    }
};

// This `new` (constructor definition) is needed to get worker-loader + TypeScript work
declare const self: ServiceWorkerGlobalScope;
const ctx: Worker & { new (): Worker} = self as never;
export default ctx;
