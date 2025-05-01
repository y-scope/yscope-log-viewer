import {create} from "zustand";

import {CONFIG_KEY} from "../../typings/config";
import {LOG_LEVEL} from "../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../typings/notifications";
import {UI_STATE} from "../../typings/states";
import {TAB_NAME} from "../../typings/tab";
import {
    CURSOR_CODE,
    CursorType,
    PageData,
} from "../../typings/worker";
import {getConfig} from "../../utils/config";
import useContextStore from "./contextStore";
import useLogFileManagerStore from "./LogFileManagerStore";
import useViewStore from "./viewStore";


interface uiStoreState {
    activeTabName: TAB_NAME;
    isPrettified: boolean;
    uiState: UI_STATE;

    setActiveTabName: (tabName: TAB_NAME) => void;
    setIsPrettified: (newIsPrettified: boolean) => void;
    setUiState: (newUIState: UI_STATE) => void;
}

const UI_STORE_DEFAULT = {
    activeTabName: getConfig(CONFIG_KEY.INITIAL_TAB_NAME),
    isPrettified: false,
    uiState: UI_STATE.UNOPENED,
};

const useUiStore = create<uiStoreState>((set, get) => ({
    ...UI_STORE_DEFAULT,
    setActiveTabName: (tabName) => {
        set({activeTabName: tabName});
    },
    setIsPrettified: (newIsPrettified: boolean) => {
        if (newIsPrettified === get().isPrettified) {
            return;
        }
        set({isPrettified: newIsPrettified});
        set({uiState: UI_STATE.FAST_LOADING});

        const {logEventNum} = useContextStore.getState();
        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (0 !== logEventNum) {
            cursor = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            };
        }

        useLogFileManagerStore.getState().wrappedLogFileManager.loadPage(
            cursor,
            newIsPrettified
        ).then((pageData: PageData) => {
            useViewStore.getState().updatePageData(pageData);
        })
            .catch((reason: unknown) => {
                useContextStore.getState().postPopUp({
                    level: LOG_LEVEL.ERROR,
                    message: String(reason),
                    timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                    title: "Action failed",
                });
            });
    },
    setUiState: (newUIState: UI_STATE) => {
        set({uiState: newUIState});
    },
}));

export default useUiStore;
