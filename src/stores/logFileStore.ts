import * as Comlink from "comlink";
import {create} from "zustand";

import {updateWindowUrlSearchParams} from "../contexts/UrlContextProvider";
import {FILE_TYPE} from "../services/LogFileManager";
import {Nullable} from "../typings/common";
import {CONFIG_KEY} from "../typings/config";
import {LOG_LEVEL} from "../typings/logs";
import {
    DO_NOT_TIMEOUT_VALUE,
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
import useContextStore from "./contextStore";
import useLogExportStore, {LOG_EXPORT_STORE_DEFAULT} from "./logExportStore";
import useLogFileManagerProxyStore from "./logFileManagerProxyStore";
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
        const {setFileName, setOnDiskFileSizeInBytes} = get();
        const {postPopUp} = useContextStore.getState();
        const {setExportProgress} = useLogExportStore.getState();
        const {logFileManagerProxy} = useLogFileManagerProxyStore.getState();
        const {clearQuery} = useQueryStore.getState();
        const {setUiState} = useUiStore.getState();
        const {isPrettified, setLogData, updatePageData} = useViewStore.getState();

        setFileName("Loading...");
        setOnDiskFileSizeInBytes(LOG_FILE_STORE_DEFAULT.onDiskFileSizeInBytes);
        setExportProgress(LOG_EXPORT_STORE_DEFAULT.exportProgress);
        clearQuery();
        setUiState(UI_STATE.FILE_LOADING);
        setLogData("Loading...");

        set({fileSrc});
        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }

        const decoderOptions = getConfig(CONFIG_KEY.DECODER_OPTIONS);
        (async () => {
            const fileInfo = await logFileManagerProxy.loadFile(
                {
                    decoderOptions: decoderOptions,
                    fileSrc: fileSrc,
                    pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
                },
                Comlink.proxy(handleExportChunk),
                Comlink.proxy(handleQueryResults)
            );
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
            set(fileInfo);
            updatePageData(pageData);

            const canFormat = fileInfo.fileType === FILE_TYPE.CLP_KV_IR ||
                fileInfo.fileType === FILE_TYPE.JSONL;

            if (0 === decoderOptions.formatString.length && canFormat) {
                postPopUp(FORMAT_POP_UP_MESSAGE);
            }
        })().catch((e: unknown) => {
            console.error(e);
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
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
