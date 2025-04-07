import {create} from "zustand";

import {CONFIG_KEY} from "../../typings/config";
import {
    BeginLineNumToLogEventNumMap,
    CursorType,
    FileSrcType,
    WORKER_REQ_CODE,
} from "../../typings/worker";
import {getConfig} from "../../utils/config";
import useMainWorkerStore from "./mainWorkerStore";


const LOG_FILE_DEFAULT = {
    beginLineNumToLogEventNum: new Map<number, number>(),
    fileName: "",
    logData: "No file is open.",
    numEvents: 0,
    numPages: 0,
    onDiskFileSizeInBytes: 0,
    pageNum: 0,
};

interface logFileState {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    fileName: string;
    logData: string;
    numEvents: number;
    numPages: number;
    onDiskFileSizeInBytes: number;
    pageNum: number;

    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void;
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => void;
    setFileName: (newFileName: string) => void;
    setLogData: (newLogData: string) => void;
    setNumEvents: (newNumEvents: number) => void;
    setNumPages: (newNumPages: number) => void;
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes: number) => void;
    setPageNum: (newPageNum: number) => void;
}

const useLogFileStore = create<logFileState>((set) => ({
    ...LOG_FILE_DEFAULT,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => {
        const {init} = useMainWorkerStore.getState();
        init();
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("loadFile: Main worker is not initialized.");

            return;
        }
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_FILE,
            args: {
                fileSrc: fileSrc,
                pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
                cursor: cursor,
                decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
            },
        });
    },
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => {
        set({beginLineNumToLogEventNum: newMap});
    },
    setFileName: (newFileName) => {
        set({fileName: newFileName});
    },
    setLogData: (newLogData) => {
        set({logData: newLogData});
    },
    setNumEvents: (newNumEvents) => {
        set({numEvents: newNumEvents});
    },
    setNumPages: (newNumPages) => {
        set({numPages: newNumPages});
    },
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes) => {
        set({onDiskFileSizeInBytes: newOnDiskFileSizeInBytes});
    },
    setPageNum: (newPageNum) => {
        set({pageNum: newPageNum});
    },
}));

export {
    LOG_FILE_DEFAULT,
    useLogFileStore,
};
