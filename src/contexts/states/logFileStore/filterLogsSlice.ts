import {StateCreator} from "zustand/index";

import {LogLevelFilter} from "../../../typings/logs";
import {UI_STATE} from "../../../typings/states";
import {
    CURSOR_CODE,
    WORKER_REQ_CODE,
} from "../../../typings/worker";
import useMainWorkerStore from "../mainWorkerStore";
import useQueryStore from "../queryStore";
import useUiStore from "../uiStore";
import {
    FilterLogsSlice,
    LogFileState,
} from "./types";


/**
 * Creates a slice for filtering logs by a given log level.
 *
 * @param _
 * @param get
 * @return
 */
const createFilterLogsSlice: StateCreator<
    LogFileState,
    [],
    [],
    FilterLogsSlice
> = (_, get) => ({
    filterLogs: (filter: LogLevelFilter) => {
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("filterLogs: Main worker is not initialized.");

            return;
        }
        const {isPrettified, setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        const {logEventNum} = get();

        mainWorker.postMessage({
            code: WORKER_REQ_CODE.SET_FILTER,
            args: {
                cursor: {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {
                        eventNum: 0 === logEventNum ?
                            1 :
                            logEventNum,
                    },
                },
                isPrettified: isPrettified,
                logLevelFilter: filter,
            },
        });
        useQueryStore.getState().startQuery();
    },
});

export default createFilterLogsSlice;
