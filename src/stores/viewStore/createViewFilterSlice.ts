import {StateCreator} from "zustand";

import {LogLevelFilter} from "../../typings/logs";
import {UI_STATE} from "../../typings/states";
import {CURSOR_CODE} from "../../typings/worker";
import useLogFileStore from "../logFileStore";
import useQueryStore from "../queryStore";
import useUiStore from "../uiStore";
import {
    ViewFilterSlice,
    ViewState,
} from "./types";


/**
 * Creates a slice for view utility functions.
 *
 * @param _
 * @param get
 * @return
 */
const createViewFilterSlice: StateCreator<
    ViewState, [], [], ViewFilterSlice
> = (_, get) => ({
    filterLogs: (filter: LogLevelFilter) => {
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        const {logFileManager} = useLogFileStore.getState();
        if (null === logFileManager) {
            console.error("LogFileManager is not initialized.");

            return;
        }
        const {isPrettified, logEventNum} = get();
        logFileManager.setLogLevelFilter(filter);

        const pageData = logFileManager.loadPage(
            {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            },
            isPrettified
        );

        const {updatePageData} = get();
        updatePageData(pageData);
        setUiState(UI_STATE.READY);

        const {startQuery} = useQueryStore.getState();
        startQuery();
    },

});

export default createViewFilterSlice;
