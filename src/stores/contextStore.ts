import {create} from "zustand";

import {PopUpMessage} from "../typings/notifications";


interface ContextValues {
    logEventNum: number;
    postPopUp: (message: PopUpMessage) => void;
}

interface ContextActions {
    setLogEventNum: (newLogEventNum: number) => void;
    setPostPopUp: (postPopUp: (message: PopUpMessage) => void) => void;
}

type ContextState = ContextValues & ContextActions;

const CONTEXT_STORE_DEFAULT: ContextValues = {
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
export {CONTEXT_STORE_DEFAULT};
