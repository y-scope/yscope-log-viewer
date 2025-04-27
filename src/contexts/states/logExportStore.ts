import {create} from "zustand";

import LogExportManager from "../../services/LogExportManager";
import {Nullable} from "../../typings/common";
import {WORKER_REQ_CODE} from "../../typings/worker";
import {EXPORT_LOGS_CHUNK_SIZE} from "../../utils/config";
import useLogFileStore from "./logFileStore";
import useMainWorkerStore from "./mainWorkerStore";


interface LogExportState {
    exportProgress: number;
    logExportManager: Nullable<LogExportManager>;

    exportLogs: ()=> void;
    setExportProgress: (newProgress: number) => void;
}

const useLogExportStore = create<LogExportState>((set) => ({
    exportProgress: 0,
    logExportManager: null,

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
    setExportProgress: (newProgress) => {
        set({exportProgress: newProgress});
    },
}));

export default useLogExportStore;
