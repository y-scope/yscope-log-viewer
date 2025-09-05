import {StateCreator} from "zustand";

import {
    ViewEventSlice,
    ViewEventValues,
    ViewState,
} from "./types";


const VIEW_EVENT_DEFAULT: ViewEventValues = {
    logEventNum: 0,
    dateTimeString: new Date().toISOString()
        .slice(0, -1),
};

/**
 * Creates a slice for updating log events.
 *
 * @param set
 * @return
 */
const createViewEventSlice: StateCreator<
    ViewState, [], [], ViewEventSlice
> = (set) => ({
    ...VIEW_EVENT_DEFAULT,
    setLogEventNum: (logEventNum: number) => {
        set({logEventNum});
    },
    setDateTimeString: (dateTimeString: string) => {
        set({dateTimeString});
    },
});

export {VIEW_EVENT_DEFAULT};
export default createViewEventSlice;
