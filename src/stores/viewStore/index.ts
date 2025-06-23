import {create} from "zustand";

import createViewEventSlice from "./createViewEventSlice";
import createViewFilterSlice from "./createViewFilterSlice";
import createViewFormattingSlice from "./createViewFormattingSlice";
import createViewPageSlice from "./createViewPageSlice";
import {ViewState} from "./types";


const useViewStore = create<ViewState>((...args) => ({
    ...createViewEventSlice(...args),
    ...createViewFilterSlice(...args),
    ...createViewFormattingSlice(...args),
    ...createViewPageSlice(...args),
}));

export default useViewStore;
