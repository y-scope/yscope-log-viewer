import {create} from "zustand";

import {PopUpMessage} from "../typings/notifications";


interface ContextValues {
    postPopUp: (message: PopUpMessage) => void;
}

interface ContextActions {
    setPostPopUp: (postPopUp: (message: PopUpMessage) => void) => void;
}

type ContextState = ContextValues & ContextActions;

const CONTEXT_STORE_DEFAULT: ContextValues = {
    postPopUp: () => {
    },
};

const useContextStore = create<ContextState>((set) => ({
    ...CONTEXT_STORE_DEFAULT,
    setPostPopUp: (postPopUp) => {
        set({postPopUp});
    },
}));

export default useContextStore;
export {CONTEXT_STORE_DEFAULT};
