import {StateCreator} from "zustand";

import {LogLevelFilter} from "../../typings/logs";
import {UI_STATE} from "../../typings/states";
import {CURSOR_CODE} from "../../typings/worker";
import useLogFileManagerStore from "../logFileManagerProxyStore";
import {handleErrorWithNotification} from "../notificationStore";
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
        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const {logEventNum} = get();
            const pageData = await logFileManagerProxy.setFilter(
                {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {
                        eventNum: logEventNum,
                    },
                },
                filter
            );

            const {updatePageData} = get();
            updatePageData(pageData);
            setUiState(UI_STATE.READY);

            const {startQuery} = useQueryStore.getState();
            startQuery();
        })().catch(handleErrorWithNotification);
    },

});

export default createViewFilterSlice;
