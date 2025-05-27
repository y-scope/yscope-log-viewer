import {create} from "zustand";


interface ContextValues {
    logEventNum: number;
}

interface ContextActions {
    setLogEventNum: (newLogEventNum: number) => void;
}

type ContextState = ContextValues & ContextActions;

const CONTEXT_STORE_DEFAULT: ContextValues = {
    logEventNum: 0,
};

const useContextStore = create<ContextState>((set) => ({
    ...CONTEXT_STORE_DEFAULT,
    setLogEventNum: (newLogEventNum) => {
        set({logEventNum: newLogEventNum});
    },
}));

export default useContextStore;
export {CONTEXT_STORE_DEFAULT};
