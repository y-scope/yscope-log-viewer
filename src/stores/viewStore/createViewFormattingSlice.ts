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
const togglePrettify = () => {
    const {isPrettified} = useViewStore.getState();
    updateWindowUrlHashParams({[HASH_PARAM_NAMES.IS_PRETTIFIED]: !isPrettified});
    updateViewHashParams();
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
