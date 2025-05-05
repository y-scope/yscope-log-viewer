import {create} from "zustand";

import LogExportManager from "../../services/LogExportManager";
import {Nullable} from "../../typings/common";
import {LOG_LEVEL} from "../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../typings/notifications";
import {EXPORT_LOGS_CHUNK_SIZE} from "../../utils/config";
import useContextStore from "./contextStore";
import useLogFileManagerStore from "./LogFileManagerStore";
import useLogFileStore from "./logFileStore";


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
        const {numEvents, fileName} = useLogFileStore.getState();
        const logExportManager = new LogExportManager(
            Math.ceil(numEvents / EXPORT_LOGS_CHUNK_SIZE),
            fileName
        );

        set({logExportManager});
        useLogFileManagerStore
            .getState()
            .logFileManagerProxy
            .exportLogs().catch((reason: unknown) => {
                useContextStore.getState().postPopUp({
                    level: LOG_LEVEL.ERROR,
                    message: String(reason),
                    timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                    title: "Action failed",
                });
            });
    },
}));

export default useLogExportStore;
