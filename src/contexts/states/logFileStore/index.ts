import {create} from "zustand";

import {CONFIG_KEY} from "../../../typings/config";
import {getConfig} from "../../../utils/config";
import createFilterLogsSlice from "./filterLogsSlice";
import createLoadSlice from "./loadSlice";
import createLogFileSetterSlice from "./setterSlice";
import {LogFileState} from "./types";


const LOG_FILE_DEFAULT = {
    activeTabName: getConfig(CONFIG_KEY.INITIAL_TAB_NAME),
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

const useLogFileStore = create<LogFileState>((...a) => ({
    ...LOG_FILE_DEFAULT,
    ...createLogFileSetterSlice(...a),
    ...createFilterLogsSlice(...a),
    ...createLoadSlice(...a),
}));

export default useLogFileStore;
