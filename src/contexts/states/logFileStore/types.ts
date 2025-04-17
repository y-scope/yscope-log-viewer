import {Nullable} from "../../../typings/common";
import {LogLevelFilter} from "../../../typings/logs";
import {PopUpMessage} from "../../../typings/notifications";
import {TAB_NAME} from "../../../typings/tab";
import {
    BeginLineNumToLogEventNumMap,
    CursorType,
    FileSrcType,
} from "../../../typings/worker";
import {NavigationAction} from "../../../utils/actions";


interface LogFileMetadataSlice {
    activeTabName: TAB_NAME;
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    fileName: string;
    fileSrc: Nullable<FileSrcType>;
    logData: string;
    logEventNum: number;
    numEvents: number;
    numPages: number;
    onDiskFileSizeInBytes: number;
    pageNum: number;
    postPopUp: (message: PopUpMessage) => void;
}

interface LogFileSetterSlice {
    setActiveTabName: (tabName: TAB_NAME) => void;
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => void;
    setFileName: (newFileName: string) => void;
    setLogData: (newLogData: string) => void;
    setLogEventNum: (newLogEventNum: number) => void;
    setNumEvents: (newNumEvents: number) => void;
    setNumPages: (newNumPages: number) => void;
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes: number) => void;
    setPageNum: (newPageNum: number) => void;
    setPostPopUp: (postPopUp: (message: PopUpMessage) => void) => void;
}

interface FilterLogsSlice {
    filterLogs: (filter: LogLevelFilter) => void;
}

interface LoadSlice {
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void;
    loadPageByAction: (navAction: NavigationAction) => void;
}

type LogFileState = LogFileMetadataSlice & LogFileSetterSlice & FilterLogsSlice & LoadSlice;

export type {
    FilterLogsSlice,
    LoadSlice,
    LogFileMetadataSlice,
    LogFileSetterSlice,
    LogFileState,
};
