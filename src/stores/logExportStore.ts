import {create} from "zustand";

import LogExportManager, {EXPORT_LOGS_PROGRESS_VALUE_MIN} from "../services/LogExportManager";
import {Nullable} from "../typings/common";
import {EXPORT_LOGS_CHUNK_SIZE} from "../utils/config";
import useLogFileStore from "./logFileStore";


interface LogExportValues {
    exportProgress: Nullable<number>;
    logExportManager: Nullable<LogExportManager>;
}

interface LogExportActions {
    setExportProgress: (newProgress: Nullable<number>) => void;

    exportLogs: () => void;
}

type LogExportState = LogExportValues & LogExportActions;

const LOG_EXPORT_STORE_DEFAULT: LogExportValues = {
    exportProgress: null,
    logExportManager: null,
};

const useLogExportStore = create<LogExportState>((set) => ({
    ...LOG_EXPORT_STORE_DEFAULT,
    setExportProgress: (newProgress) => {
        set({exportProgress: newProgress});
    },
    exportLogs: () => {
        set({exportProgress: EXPORT_LOGS_PROGRESS_VALUE_MIN});

        const {fileName, numEvents} = useLogFileStore.getState();
        const logExportManager = new LogExportManager(
            Math.ceil(numEvents / EXPORT_LOGS_CHUNK_SIZE),
            fileName
        );

        set({logExportManager});

        const {logFileManager} = useLogFileStore.getState();
        if (null === logFileManager) {
            console.error("LogFileManager is not initialized.");

            return;
        }
        logFileManager.exportChunkAndScheduleNext(0);
    },
}));

export default useLogExportStore;
export {LOG_EXPORT_STORE_DEFAULT};
