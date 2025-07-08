import {StateCreator} from "zustand";

import {
    ViewFormattingSlice,
    ViewFormattingValues,
    ViewState,
} from "./types";


const VIEW_FORMATTING_DEFAULT: ViewFormattingValues = {
    isPrettified: false,
};

/**
 * Creates a slice for managing log formatting state.
 *
 * @param set
 * @return
 */
const createViewFormattingSlice: StateCreator<
    ViewState, [], [], ViewFormattingSlice
> = (set) => ({
    ...VIEW_FORMATTING_DEFAULT,
    setIsPrettified: (newIsPrettified: boolean) => {
        set({isPrettified: newIsPrettified});
    },
});

export default createViewFormattingSlice;
