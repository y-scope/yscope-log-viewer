import {create} from "zustand";

import {CONFIG_KEY} from "../typings/config";
import {UI_STATE} from "../typings/states";
import {TAB_NAME} from "../typings/tab";
import {getConfig} from "../utils/config";


interface UiStoreValues {
    activeTabName: TAB_NAME;
    uiState: UI_STATE;
}

interface UiStoreActions {
    setActiveTabName: (tabName: TAB_NAME) => void;
    setUiState: (newUIState: UI_STATE) => void;
}

type UiStoreState = UiStoreValues & UiStoreActions;

const UI_STORE_DEFAULT: UiStoreValues = {
    activeTabName: getConfig(CONFIG_KEY.INITIAL_TAB_NAME),
    uiState: UI_STATE.UNOPENED,
};

const useUiStore = create<UiStoreState>((set) => ({
    ...UI_STORE_DEFAULT,
    setActiveTabName: (tabName) => {
        set({activeTabName: tabName});
    },
    setUiState: (newUIState: UI_STATE) => {
        set({uiState: newUIState});
    },
}));

export default useUiStore;
