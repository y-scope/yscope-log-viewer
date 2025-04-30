import {create} from "zustand";

import {Nullable} from "../../typings/common";
import {CONFIG_KEY} from "../../typings/config";
import {UI_STATE} from "../../typings/states";
import {SEARCH_PARAM_NAMES} from "../../typings/url";
import {
    CursorType,
    FileSrcType,
    WORKER_REQ_CODE,
} from "../../typings/worker";
import {getConfig} from "../../utils/config";
import {updateWindowUrlSearchParams} from "../UrlContextProvider";
import useLogExportStore from "./logExportStore";
import useMainWorkerStore from "./mainWorkerStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";


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

const useLogFileStore = create<LogFileState>((set) => ({
    ...LOG_FILE_STORE_DEFAULT,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => {
        const {isPrettified, setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FILE_LOADING);

        useMainWorkerStore.getState().init();
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("loadFile: Main worker is not initialized.");

            return;
        }
        useQueryStore.getState().clearQuery();
        useLogExportStore.getState().setExportProgress(0);

        set({fileSrc});
        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_FILE,
            args: {
                cursor: cursor,
                decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
                fileSrc: fileSrc,
                isPrettified: isPrettified,
                pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
            },
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
