import * as Comlink from "comlink";
import {create} from "zustand";

import {Nullable} from "../../typings/common";
import {CONFIG_KEY} from "../../typings/config";
import {LOG_LEVEL} from "../../typings/logs";
import {
    DO_NOT_TIMEOUT_VALUE,
    LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
} from "../../typings/notifications";
import {QueryResults} from "../../typings/query";
import {UI_STATE} from "../../typings/states";
import {SEARCH_PARAM_NAMES} from "../../typings/url";
import {
    CursorType,
    FileSrcType,
} from "../../typings/worker";
import {getConfig} from "../../utils/config";
import {updateWindowUrlSearchParams} from "../UrlContextProvider";
import useContextStore from "./contextStore";
import useLogExportStore, {LOG_EXPORT_STORE_DEFAULT} from "./logExportStore";
import useLogFileManagerStore from "./LogFileManagerProxyStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";
import useViewStore, {VIEW_STORE_DEFAULT} from "./viewStore";


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
 * Post a popup about the format string option in the settings.
 */
const postFormatPopup = () => {
    useContextStore.getState().postPopUp({
        level: LOG_LEVEL.INFO,
        message: "Adding a format string can enhance the readability of your" +
                    " structured logs by customizing how fields are displayed.",
        timeoutMillis: LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
        title: "A format string has not been configured",
    });
};

// eslint-disable-next-line max-lines-per-function
const useLogFileStore = create<LogFileState>((set, get) => ({
    ...LOG_FILE_STORE_DEFAULT,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => {
        const {setUiState} = useUiStore.getState();
        const {isPrettified} = useViewStore.getState();
        const {setFileName, setOnDiskFileSizeInBytes} = get();
        setUiState(UI_STATE.FILE_LOADING);
        setFileName(LOG_FILE_STORE_DEFAULT.fileName);
        useViewStore.getState().setLogData(VIEW_STORE_DEFAULT.logData);
        setOnDiskFileSizeInBytes(LOG_FILE_STORE_DEFAULT.onDiskFileSizeInBytes);

        useQueryStore.getState().clearQuery();
        useLogExportStore.getState().setExportProgress(LOG_EXPORT_STORE_DEFAULT.exportProgress);

        set({fileSrc});
        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }

        const onExportChunk = (logs: string) => {
            const {logExportManager} = useLogExportStore.getState();
            if (null !== logExportManager) {
                const progress = logExportManager.appendChunk(logs);
                useLogExportStore.getState().setExportProgress(progress);
            }
        };

        const onQueryResults = (progress: number, results: QueryResults) => {
            const {clearQueryResults, setQueryProgress, mergeQueryResults} =
                useQueryStore.getState();

            if (0 === progress) {
                clearQueryResults();

                return;
            }
            setQueryProgress(progress);
            mergeQueryResults(results);
        };

        const decoderOptions = getConfig(CONFIG_KEY.DECODER_OPTIONS);
        (async () => {
            const {fileInfo, pageData} = await useLogFileManagerStore
                .getState()
                .logFileManagerProxy
                .loadFile(
                    {
                        cursor: cursor,
                        decoderOptions: decoderOptions,
                        fileSrc: fileSrc,
                        isPrettified: isPrettified,
                        pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
                    },
                    Comlink.proxy(onExportChunk),
                    Comlink.proxy(onQueryResults)
                );

            set(fileInfo);
            useViewStore.getState().updatePageData(pageData);

            if (fileInfo.isStructuredLog && 0 === decoderOptions.formatString.length) {
                postFormatPopup();
            }
        })().catch((reason: unknown) => {
            useContextStore.getState().postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(reason),
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
