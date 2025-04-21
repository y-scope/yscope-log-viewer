import {create} from "zustand";

import {UI_STATE} from "../../typings/states";
import {
    CURSOR_CODE,
    CursorType,
    WORKER_REQ_CODE,
} from "../../typings/worker";
import useLogFileStore from "./logFileStore";
import useMainWorkerStore from "./mainWorkerStore";


interface uiStoreState {
    isPrettified: boolean;
    uiState: UI_STATE;

    setIsPrettified: (newIsPrettified: boolean) => void;
    setUiState: (newUIState: UI_STATE) => void;
}

const useUiStore = create<uiStoreState>((set, get) => ({
    isPrettified: false,
    uiState: UI_STATE.UNOPENED,

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
