import {create} from "zustand";

import {PopUpMessage} from "../../typings/notifications";


interface ContextState {
    // States
    logEventNum: number;
    postPopUp: (message: PopUpMessage) => void;

    // Setters
    setLogEventNum: (newLogEventNum: number) => void;
    setPostPopUp: (postPopUp: (message: PopUpMessage) => void) => void;
}

const CONTEXT_STORE_DEFAULT = {
    logEventNum: 0,
    postPopUp: () => {
    },
};

const useContextStore = create<ContextState>((set) => ({
    ...CONTEXT_STORE_DEFAULT,
    setLogEventNum: (newLogEventNum) => {
        set({logEventNum: newLogEventNum});
    },
    setPostPopUp: (postPopUp) => {
        set({postPopUp});
    },
}));

export default useContextStore;
