import * as Comlink from "comlink";
import {create} from "zustand";

import {Nullable} from "../../typings/common";
import {CONFIG_KEY} from "../../typings/config";
import {LOG_LEVEL} from "../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../typings/notifications";
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
import useLogExportStore from "./logExportStore";
import useLogFileManagerStore from "./LogFileManagerStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";
import useViewStore from "./viewStore";

interface LogFileState {
    // States
    fileName: string;
    fileSrc: Nullable<FileSrcType>;
    numEvents: number;
    onDiskFileSizeInBytes: number;

    // Setters
    setFileName: (newFileName: string) => void;
    setNumEvents: (newNumEvents: number) => void;
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes: number) => void;

    // Actions
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void;
}

const LOG_FILE_STORE_DEFAULT = {
    fileName: "Loading...",
    fileSrc: null,
    numEvents: 0,
    onDiskFileSizeInBytes: 0,
};

// eslint-disable-next-line max-lines-per-function
const useLogFileStore = create<LogFileState>((set) => ({
    ...LOG_FILE_STORE_DEFAULT,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => {
        const {isPrettified, setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FILE_LOADING);

        const {wrappedLogFileManager} = useLogFileManagerStore.getState();

        useQueryStore.getState().clearQuery();
        useLogExportStore.getState().setExportProgress(0);

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

        wrappedLogFileManager
            .loadFile(
                getConfig(CONFIG_KEY.DECODER_OPTIONS),
                fileSrc,
                getConfig(CONFIG_KEY.PAGE_SIZE),
                Comlink.proxy(onExportChunk),
                Comlink.proxy(onQueryResults),
                cursor,
                isPrettified
            )
            .then(({fileInfo, pageData}) => {
                set(fileInfo);
                useViewStore.getState().updatePageData(pageData);
            })
            .catch((reason: unknown) => {
                useContextStore.getState().postPopUp({
                    level: LOG_LEVEL.ERROR,
                    message: String(reason),
                    timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                    title: "Action failed",
                });
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
