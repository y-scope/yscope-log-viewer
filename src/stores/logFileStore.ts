/* eslint max-lines-per-function: ["error", 70] */
import * as Comlink from "comlink";
import {create} from "zustand";

import {FILE_TYPE} from "../services/LogFileManager";
import {Nullable} from "../typings/common";
import {CONFIG_KEY} from "../typings/config";
import {LOG_LEVEL} from "../typings/logs";
import {
    LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
    PopUpMessage,
} from "../typings/notifications";
import {
    QUERY_PROGRESS_VALUE_MIN,
    QueryResults,
} from "../typings/query";
import {UI_STATE} from "../typings/states";
import {SEARCH_PARAM_NAMES} from "../typings/url";
import {
    CursorType,
    FileSrcType,
} from "../typings/worker";
import {getConfig} from "../utils/config";
import {updateWindowUrlSearchParams} from "../utils/url";
import useLogExportStore, {LOG_EXPORT_STORE_DEFAULT} from "./logExportStore";
import useLogFileManagerProxyStore from "./logFileManagerProxyStore";
import useNotificationStore, {handleErrorWithNotification} from "./notificationStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";
import useViewStore from "./viewStore";


interface LogFileValues {
    fileName: string;
    fileSrc: Nullable<FileSrcType>;
    numEvents: number;
    onDiskFileSizeInBytes: number;
}

interface LogFileActions {
    setFileName: (newFileName: string) => void;
    setNumEvents: (newNumEvents: number) => void;
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes: number) => void;

    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void;
}

type LogFileState = LogFileValues & LogFileActions;

const LOG_FILE_STORE_DEFAULT: LogFileValues = {
    fileName: "",
    fileSrc: null,
    numEvents: 0,
    onDiskFileSizeInBytes: 0,
};

/**
 * Format popup message shown when a structured log is loaded without a format string.
 */
const FORMAT_POP_UP_MESSAGE: PopUpMessage = Object.freeze({
    level: LOG_LEVEL.INFO,
    message: "Adding a format string can enhance the readability of your" +
                    " structured logs by customizing how fields are displayed.",
    timeoutMillis: LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
    title: "A format string has not been configured",
});

/**
 * Handles export progress and append chunks to log file.
 *
 * @param logs
 */
const handleExportChunk = (logs: string) => {
    const {logExportManager, setExportProgress} = useLogExportStore.getState();

    if (null !== logExportManager) {
        const progress = logExportManager.appendChunk(logs);
        setExportProgress(progress);
    }
};

/**
 * Handles query results by updating the query progress and merging the results.
 *
 * @param progress
 * @param results
 */
const handleQueryResults = (progress: number, results: QueryResults) => {
    const {clearQueryResults, mergeQueryResults, setQueryProgress} = useQueryStore.getState();

    setQueryProgress(progress);
    if (QUERY_PROGRESS_VALUE_MIN === progress) {
        clearQueryResults();

        return;
    }
    mergeQueryResults(results);
};

const useLogFileStore = create<LogFileState>((set, get) => ({
    ...LOG_FILE_STORE_DEFAULT,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => {
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FILE_LOADING);

        const {setFileName, setOnDiskFileSizeInBytes} = get();
        setFileName("Loading...");
        setOnDiskFileSizeInBytes(LOG_FILE_STORE_DEFAULT.onDiskFileSizeInBytes);

        const {setExportProgress} = useLogExportStore.getState();
        setExportProgress(LOG_EXPORT_STORE_DEFAULT.exportProgress);

        set({fileSrc});
        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerProxyStore.getState();
            const decoderOptions = getConfig(CONFIG_KEY.DECODER_OPTIONS);
            const fileInfo = await logFileManagerProxy.loadFile(
                {
                    decoderOptions: decoderOptions,
                    fileSrc: fileSrc,
                    pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
                },
                Comlink.proxy(handleExportChunk),
                Comlink.proxy(handleQueryResults)
            );

            set(fileInfo);

            const {isPrettified, updatePageData} = useViewStore.getState();
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
            updatePageData(pageData);

            const {startQuery} = useQueryStore.getState();
            startQuery();
            const canFormat = fileInfo.fileType === FILE_TYPE.CLP_KV_IR ||
                fileInfo.fileType === FILE_TYPE.JSONL;

            if (0 === decoderOptions.formatString.length && canFormat) {
                const {postPopUp} = useNotificationStore.getState();
                postPopUp(FORMAT_POP_UP_MESSAGE);
            }
        })().catch((e: unknown) => {
            handleErrorWithNotification(e);
            setUiState(UI_STATE.UNOPENED);
        });
    },
    setFileName: (newFileName) => {
        set({fileName: newFileName});
    },
    setNumEvents: (newNumEvents) => {
        set({numEvents: newNumEvents});
    },
    setOnDiskFileSizeInBytes: (newSize) => {
        set({onDiskFileSizeInBytes: newSize});
    },
}));

export default useLogFileStore;
