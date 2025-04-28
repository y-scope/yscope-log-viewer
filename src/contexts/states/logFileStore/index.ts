import {create} from "zustand";

import createFilterLogsSlice from "./filterLogsSlice";
import createLoadSlice from "./loadSlice";
import createLogFileSetterSlice from "./setterSlice";
import {LogFileState} from "./types";


const LOG_FILE_DEFAULT = {
    beginLineNumToLogEventNum: new Map<number, number>(),
    fileName: "Loading...",
    fileSrc: null,
    logData: "Loading...",
    logEventNum: 0,
    numEvents: 0,
    numPages: 0,
    onDiskFileSizeInBytes: 0,
    pageNum: 0,
    postPopUp: () => {
    },
};

const useLogFileStore = create<LogFileState>((...args) => ({
    ...LOG_FILE_DEFAULT,
    ...createLogFileSetterSlice(...args),
    ...createFilterLogsSlice(...args),
    ...createLoadSlice(...args),
}));

export default useLogFileStore;
