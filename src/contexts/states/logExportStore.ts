import {create} from "zustand";

import LogExportManager, {EXPORT_LOGS_PROGRESS_VALUE_MIN} from "../../services/LogExportManager";
import {Nullable} from "../../typings/common";
import {LOG_LEVEL} from "../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../typings/notifications";
import {EXPORT_LOGS_CHUNK_SIZE} from "../../utils/config";
import useContextStore from "./contextStore";
import useLogFileManagerStore from "./LogFileManagerProxyStore";
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
        set({exportProgress: LOG_EXPORT_STORE_DEFAULT.exportProgress});
        const {fileName, numEvents} = useLogFileStore.getState();
        const logExportManager = new LogExportManager(
            Math.ceil(numEvents / EXPORT_LOGS_CHUNK_SIZE),
            fileName
        );

        set({logExportManager});
        (async () => {
            await useLogFileManagerStore
                .getState()
                .logFileManagerProxy
                .exportLogs();
        })().catch((reason: unknown) => {
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
export {LOG_EXPORT_STORE_DEFAULT};
