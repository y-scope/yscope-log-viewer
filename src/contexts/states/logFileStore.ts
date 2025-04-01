import {create} from "zustand";


const LOG_FILE_DEFAULT = {
    fileName: "",
    logData: "No file is open.",
    numEvents: 0,
    numPages: 0,
    onDiskFileSizeInBytes: 0,
    pageNum: 0,
};

interface logFileState {
    fileName: string;
    logData: string;
    numEvents: number;
    numPages: number;
    onDiskFileSizeInBytes: number;
    pageNum: number;

    setFileName: (newFileName: string) => void;
    setLogData: (newLogData: string) => void;
    setNumEvents: (newNumEvents: number) => void;
    setNumPages: (newNumPages: number) => void;
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes: number) => void;
    setPageNum: (newPageNum: number) => void;
}

const useLogFileStore = create<logFileState>((set) => ({
    ...LOG_FILE_DEFAULT,
    setFileName: (newFileName) => {
        set({fileName: newFileName});
    },
    setLogData: (newLogData) => {
        set({logData: newLogData});
    },
    setNumEvents: (newNumEvents) => {
        set({numEvents: newNumEvents});
    },
    setNumPages: (newNumPages) => {
        set({numPages: newNumPages});
    },
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes) => {
        set({onDiskFileSizeInBytes: newOnDiskFileSizeInBytes});
    },
    setPageNum: (newPageNum) => {
        set({pageNum: newPageNum});
    },
}));

export {
    LOG_FILE_DEFAULT,
    useLogFileStore,
};
