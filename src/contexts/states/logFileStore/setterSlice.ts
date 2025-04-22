import {StateCreator} from "zustand/index";

import {
    LogFileSetterSlice,
    LogFileState,
} from "./types";


/**
 *
 * Creates setters for the log file state.
 *
 * @param set Zustand set function.
 * @return
 */
const createLogFileSetterSlice: StateCreator<
    LogFileState,
    [],
    [],
    LogFileSetterSlice
> = (set) => ({
    setActiveTabName: (tabName) => {
        set({activeTabName: tabName});
    },
    setBeginLineNumToLogEventNum: (newMap) => {
        set({beginLineNumToLogEventNum: newMap});
    },
    setFileName: (newFileName) => {
        set({fileName: newFileName});
    },
    setLogData: (newLogData) => {
        set({logData: newLogData});
    },
    setLogEventNum: (newLogEventNum) => {
        set({logEventNum: newLogEventNum});
    },
    setNumEvents: (newNumEvents) => {
        set({numEvents: newNumEvents});
    },
    setNumPages: (newNumPages) => {
        set({numPages: newNumPages});
    },
    setOnDiskFileSizeInBytes: (newSize) => {
        set({onDiskFileSizeInBytes: newSize});
    },
    setPageNum: (newPageNum) => {
        set({pageNum: newPageNum});
    },
    setPostPopUp: (postPopUp) => {
        set({postPopUp});
    },
});

export default createLogFileSetterSlice;
