import {create} from "zustand";

import {UI_STATE} from "../../typings/states";


interface uiStoreState {
    uiState: UI_STATE;

    setUiState: (newUIState: UI_STATE) => void;
}

const useUiStore = create<uiStoreState>((set) => ({
    uiState: UI_STATE.UNOPENED,

    setUiState: (newUIState: UI_STATE) => {
        set({uiState: newUIState});
    },
}));

export default useUiStore;
