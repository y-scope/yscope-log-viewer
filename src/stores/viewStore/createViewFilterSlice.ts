import {StateCreator} from "zustand";

import {updateWindowUrlHashParams} from "../../utils/url";
import useLogFileManagerStore from "../logFileManagerProxyStore";
import {handleErrorWithNotification} from "../notificationStore";
import {
    ViewFilterSlice,
    ViewFilterValues,
    ViewState,
} from "./types";


const VIEW_FILTER_DEFAULT: ViewFilterValues = {
    logLevelFilter: null,
    kqlFilter: "",
    kqlFilterInput: "",
};

/**
 * Creates a slice for view utility functions.
 *
 * @param set
 * @param get
 * @return
 */
const createViewFilterSlice: StateCreator<ViewState, [], [], ViewFilterSlice> = (set, get) => ({
    ...VIEW_FILTER_DEFAULT,
    filterLogs: () => {
        (async () => {
            const {logLevelFilter, kqlFilter} = get();
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            await logFileManagerProxy.setFilter(logLevelFilter, kqlFilter);

            updateWindowUrlHashParams({query: kqlFilter});
        })().catch(handleErrorWithNotification);
    },
    setKqlFilter: (newValue) => {
        set({kqlFilter: newValue});
    },
    setKqlFilterInput: (newValue) => {
        set({kqlFilterInput: newValue});
    },
    setLogLevelFilter: (newValue) => {
        set({logLevelFilter: newValue});
    },
});

export default createViewFilterSlice;
