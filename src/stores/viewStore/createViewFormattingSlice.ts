import {StateCreator} from "zustand";

import {HASH_PARAM_NAMES} from "../../typings/url";
import {CURSOR_CODE} from "../../typings/worker";
import {updateWindowUrlHashParams} from "../../utils/url";
import {updateViewHashParams} from "../../utils/url/urlHash";
import useLogFileManagerProxyStore from "../logFileManagerProxyStore";
import {handleErrorWithNotification} from "../notificationStore";
import useViewStore from "./index";
import {
    ViewFormattingSlice,
    ViewFormattingValues,
    ViewState,
} from "./types";


const VIEW_FORMATTING_DEFAULT: ViewFormattingValues = {
    isPrettified: false,
};

/**
 * Toggles the prettify state for formatted log viewing.
 */
const togglePrettify = async () => {
    const {logEventNum, loadPageByCursor, isPrettified, setIsPrettified} = useViewStore.getState();
    const newIsPrettified = !isPrettified;

    // Update the URL and store state.
    updateWindowUrlHashParams({[HASH_PARAM_NAMES.IS_PRETTIFIED]: newIsPrettified});
    setIsPrettified(newIsPrettified);

    // Update the log file manager and reload the page.
    try {
        const {logFileManagerProxy} = useLogFileManagerProxyStore.getState();
        await logFileManagerProxy.setIsPrettified(newIsPrettified);
        await loadPageByCursor({
            code: CURSOR_CODE.EVENT_NUM,
            args: {eventNum: logEventNum},
        });
        updateViewHashParams();
    } catch (error) {
        handleErrorWithNotification(error);
    }
};

/**
 * Creates a slice for managing log formatting state.
 *
 * @param set
 * @return
 */
const createViewFormattingSlice: StateCreator<
    ViewState, [], [], ViewFormattingSlice
> = (set) => ({
    ...VIEW_FORMATTING_DEFAULT,
    setIsPrettified: (isPrettified: boolean) => {
        set({isPrettified});
    },
});

export {togglePrettify};
export default createViewFormattingSlice;
