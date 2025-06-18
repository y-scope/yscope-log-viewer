import {create} from "zustand";

import {createViewUpdateSlice} from "./createViewUpdateSlice";
import {createViewUtilitySlice} from "./createViewUtilitySlice";
import {ViewState} from "./types";


const useViewStore = create<ViewState>((...args) => ({
    ...createViewUpdateSlice(...args),
    ...createViewUtilitySlice(...args),
}));

export default useViewStore;
