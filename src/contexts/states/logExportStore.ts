import {create} from "zustand";

import LogExportManager from "../../services/LogExportManager";
import {Nullable} from "../../typings/common";


interface logExportState {
    exportProgress: number;
    logExportManager: Nullable<LogExportManager>;
    setExportProgress: (newProgress: number) => void;
}

const useLogExportStore = create<logExportState>((set) => ({
    exportProgress: 0,
    logExportManager: null,
    setExportProgress: (newProgress) => {
        set({exportProgress: newProgress});
    },
}));

export default useLogExportStore;
