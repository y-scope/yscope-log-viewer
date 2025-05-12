import {create} from "zustand";

import LogExportManager, {EXPORT_LOGS_PROGRESS_VALUE_MIN} from "../services/LogExportManager";
import {Nullable} from "../typings/common";
import {LOG_LEVEL} from "../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../typings/notifications";
import {EXPORT_LOGS_CHUNK_SIZE} from "../utils/config";
import useContextStore from "./contextStore";
import useLogFileManagerProxyStore from "./logFileManagerProxyStore";
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
        const {fileName, numEvents} = useLogFileStore.getState();

        set({exportProgress: EXPORT_LOGS_PROGRESS_VALUE_MIN});
        const logExportManager = new LogExportManager(
            Math.ceil(numEvents / EXPORT_LOGS_CHUNK_SIZE),
            fileName
        );

        set({logExportManager});

        const {postPopUp} = useContextStore.getState();
        const {logFileManagerProxy} = useLogFileManagerProxyStore.getState();

        (async () => {
            await logFileManagerProxy.exportLogs();
        })().catch((e: unknown) => {
            console.error(e);
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
        });
    },
}));

export default useLogExportStore;
export {LOG_EXPORT_STORE_DEFAULT};
