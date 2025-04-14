import {create} from "zustand";

import {Nullable} from "../../typings/common";
import {UI_STATE} from "../../typings/states";
import {
    MainWorkerRespMessage,
    WORKER_RESP_CODE,
} from "../../typings/worker";
import {updateWindowUrlHashParams} from "../UrlContextProvider";
import useLogExportStore from "./logExportStore";
import useLogFileStore from "./logFileStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";


/**
 * Handles the response from the main worker.
 *
 * @param ev
 */
const handleMainWorkerResp = (ev: MessageEvent<MainWorkerRespMessage>) => {
    const {
        setBeginLineNumToLogEventNum,
        setFileName,
        setLogData,
        setNumEvents,
        setNumPages,
        setOnDiskFileSizeInBytes,
        setPageNum,
    } = useLogFileStore.getState();
    const {setUiState} = useUiStore.getState();
    const {code, args} = ev.data;
    switch (code) {
        case WORKER_RESP_CODE.CHUNK_DATA:
        {
            const {logExportManager} = useLogExportStore.getState();
            if (null !== logExportManager) {
                const progress = logExportManager.appendChunk(args.logs);
                useLogExportStore.getState().setExportProgress(progress);
            }
            break;
        }
        case WORKER_RESP_CODE.LOG_FILE_INFO:
            setFileName(args.fileName);
            setNumEvents(args.numEvents);
            setOnDiskFileSizeInBytes(args.onDiskFileSizeInBytes);
            break;
        case WORKER_RESP_CODE.PAGE_DATA:
            setLogData(args.logs);
            setNumPages(args.numPages);
            setPageNum(args.pageNum);
            setBeginLineNumToLogEventNum(args.beginLineNumToLogEventNum);
            updateWindowUrlHashParams({
                logEventNum: args.logEventNum,
            });
            setUiState(UI_STATE.READY);
            break;
        case WORKER_RESP_CODE.QUERY_RESULT: {
            const {clearQueryResults, setQueryProgress, mergeQueryResults} = useQueryStore.getState();
            if (0 === args.progress) {
                clearQueryResults();
                break;
            }
            setQueryProgress(args.progress);
            mergeQueryResults(args.results);
            break;
        }
        default:
            console.error("Unknown code from main worker:", code);
    }
};

interface MainWorkerState {
    mainWorker: Nullable<Worker>;

    destroy: () => void;
    init: () => void;
}

const useMainWorkerStore = create<MainWorkerState>((set, get) => ({
    mainWorker: null,

    destroy: () => {
        get().mainWorker?.terminate();
        set({mainWorker: null});
    },
    init: () => {
        get().destroy();

        const mainWorker = new Worker(
            new URL("../../services/MainWorker.ts", import.meta.url)
        );

        mainWorker.onmessage = handleMainWorkerResp;
        set({mainWorker});
    },
}));

export default useMainWorkerStore;
