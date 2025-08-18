import * as Comlink from "comlink";
import {create} from "zustand";

import {Nullable} from "../typings/common";
import {CONFIG_KEY} from "../typings/config";
import {Metadata} from "../typings/decoders";
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
import {TAB_NAME} from "../typings/tab";
import {SEARCH_PARAM_NAMES} from "../typings/url";
import {FileSrcType} from "../typings/worker";
import {getConfig} from "../utils/config";
import {updateWindowUrlSearchParams} from "../utils/url";
import useLogExportStore, {LOG_EXPORT_STORE_DEFAULT} from "./logExportStore";
import useLogFileManagerProxyStore from "./logFileManagerProxyStore";
import useNotificationStore from "./notificationStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";
import useViewStore from "./viewStore";
import {VIEW_PAGE_DEFAULT} from "./viewStore/createViewPageSlice";


interface LogFileValues {
    fileName: string;
    fileSrc: Nullable<FileSrcType>;
    metadata: Nullable<Metadata>;
    numEvents: number;
    onDiskFileSizeInBytes: number;
}

interface LogFileActions {
    loadFile: (fileSrc: FileSrcType) => Promise<void>;
}

type LogFileState = LogFileValues & LogFileActions;

const LOG_FILE_STORE_DEFAULT: LogFileValues = {
    fileName: "",
    fileSrc: null,
    metadata: null,
    numEvents: 0,
    onDiskFileSizeInBytes: 0,
};

/**
 * Handles the primary action of the format popup by switching to the settings tab.
 */
const handleFormatPopupPrimaryAction = () => {
    const {setActiveTabName} = useUiStore.getState();
    setActiveTabName(TAB_NAME.SETTINGS);
};

/**
 * Format popup message shown when a structured log is loaded without a format string.
 */
const FORMAT_POP_UP_MESSAGE: PopUpMessage = Object.freeze({
    level: LOG_LEVEL.INFO,
    message: "Adding a format string can enhance the readability of your" +
                    " structured logs by customizing how fields are displayed.",
    primaryAction: {
        children: "Settings",
        onClick: handleFormatPopupPrimaryAction,
    },
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


const useLogFileStore = create<LogFileState>((set) => ({
    ...LOG_FILE_STORE_DEFAULT,
    loadFile: async (fileSrc: FileSrcType) => {
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FILE_LOADING);

        set({
            fileName: "Loading...",
            fileSrc: fileSrc,
            metadata: LOG_FILE_STORE_DEFAULT.metadata,
            onDiskFileSizeInBytes: LOG_FILE_STORE_DEFAULT.onDiskFileSizeInBytes,
        });
        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }

        const {setExportProgress} = useLogExportStore.getState();
        setExportProgress(LOG_EXPORT_STORE_DEFAULT.exportProgress);

        const {updatePageData} = useViewStore.getState();
        updatePageData({
            beginLineNumToLogEventNum: VIEW_PAGE_DEFAULT.beginLineNumToLogEventNum,
            logEventNum: useViewStore.getState().logEventNum,
            logs: "Loading...",
            numPages: VIEW_PAGE_DEFAULT.numPages,
            pageNum: VIEW_PAGE_DEFAULT.pageNum,
        });

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

        const {isPrettified} = useViewStore.getState();
        await logFileManagerProxy.setIsPrettified(isPrettified);

        if (0 === decoderOptions.formatString.length && fileInfo.fileTypeInfo.isStructured) {
            const {postPopUp} = useNotificationStore.getState();
            postPopUp(FORMAT_POP_UP_MESSAGE);
        }
    },
}));

export default useLogFileStore;
