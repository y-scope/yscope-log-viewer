import {create} from "zustand";

import {CONFIG_KEY} from "../../typings/config";
import {UI_STATE} from "../../typings/states";
import {TAB_NAME} from "../../typings/tab";
import {
    CURSOR_CODE,
    CursorType,
    WORKER_REQ_CODE,
} from "../../typings/worker";
import {getConfig} from "../../utils/config";
import useLogFileStore from "./logFileStore";
import useMainWorkerStore from "./mainWorkerStore";


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

        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("setIsPrettified: Main worker is not initialized.");

            return;
        }
        set({uiState: UI_STATE.FAST_LOADING});

        const {logEventNum} = useLogFileStore.getState();
        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (0 !== logEventNum) {
            cursor = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            };
        }
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_PAGE,
            args: {
                cursor: cursor,
                isPrettified: newIsPrettified,
            },
        });
    },
    setUiState: (newUIState: UI_STATE) => {
        set({uiState: newUIState});
    },
}));

export default useUiStore;
