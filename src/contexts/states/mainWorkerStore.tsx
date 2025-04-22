import {create} from "zustand";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import {Nullable} from "../../typings/common";
import {LOG_LEVEL} from "../../typings/logs";
import {
    DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS,
    LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
} from "../../typings/notifications";
import {UI_STATE} from "../../typings/states";
import {TAB_NAME} from "../../typings/tab";
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
        postPopUp,
        setActiveTabName,
        setBeginLineNumToLogEventNum,
        setFileName,
        setLogData,
        setNumEvents,
        setNumPages,
        setOnDiskFileSizeInBytes,
        setPageNum,
    } = useLogFileStore.getState();
    const {uiState, setUiState} = useUiStore.getState();
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
        case WORKER_RESP_CODE.FORMAT_POPUP:
            postPopUp({
                level: LOG_LEVEL.INFO,
                message: "Adding a format string can enhance the readability of your" +
                    " structured logs by customizing how fields are displayed.",
                primaryAction: {
                    children: "Settings",
                    startDecorator: <SettingsOutlinedIcon/>,
                    onClick: () => {
                        setActiveTabName(TAB_NAME.SETTINGS);
                    },
                },
                timeoutMillis: LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
                title: "A format string has not been configured",
            });
            break;
        case WORKER_RESP_CODE.LOG_FILE_INFO:
            setFileName(args.fileName);
            setNumEvents(args.numEvents);
            setOnDiskFileSizeInBytes(args.onDiskFileSizeInBytes);
            break;
        case WORKER_RESP_CODE.NOTIFICATION:
            postPopUp({
                level: args.logLevel,
                message: args.message,
                timeoutMillis: DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS,
                title: "Action failed",
            });

            switch (uiState) {
                case UI_STATE.FAST_LOADING:
                    setUiState(UI_STATE.READY);
                    break;
                case UI_STATE.FILE_LOADING:
                    setUiState(UI_STATE.UNOPENED);
                    break;
                default:
                    break;
            }

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
            const {
                clearQuery,
                setQueryProgress,
                mergeQueryResults,
            } = useQueryStore.getState();

            if (0 === args.progress) {
                clearQuery();
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
