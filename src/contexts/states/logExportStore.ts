import {create} from "zustand";

import LogExportManager from "../../services/LogExportManager";
import {Nullable} from "../../typings/common";
import {WORKER_REQ_CODE} from "../../typings/worker";
import {EXPORT_LOGS_CHUNK_SIZE} from "../../utils/config";
import useLogFileStore from "./logFileStore";
import useMainWorkerStore from "./mainWorkerStore";


interface LogExportState {
    // States
    exportProgress: number;
    logExportManager: Nullable<LogExportManager>;

    // Setters
    setExportProgress: (newProgress: number) => void;

    // Actions
    exportLogs: ()=> void;
}

const LOG_EXPORT_STORE_DEFAULT = {
    exportProgress: 0,
    logExportManager: null,
};

const useLogExportStore = create<LogExportState>((set) => ({
    ...LOG_EXPORT_STORE_DEFAULT,
    setExportProgress: (newProgress) => {
        set({exportProgress: newProgress});
    },
    exportLogs: () => {
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("exportLogs: mainWorker is not initialized.");

            return;
        }
        const {numEvents, fileName} = useLogFileStore.getState();
        const logExportManager = new LogExportManager(
            Math.ceil(numEvents / EXPORT_LOGS_CHUNK_SIZE),
            fileName
        );

        set({logExportManager});
        mainWorker.postMessage({code: WORKER_REQ_CODE.EXPORT_LOGS, args: null});
    },
}));

export default useLogExportStore;
