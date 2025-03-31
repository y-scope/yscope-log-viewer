import {create} from "zustand";


interface exportState {
    exportProgress: number;
    setExportProgress: (newProgress: number) => void;
}

const exportStore = create<exportState>((set) => ({
    exportProgress: 0,
    setExportProgress: (newProgress) => {
        set({exportProgress: newProgress});
    },
}));

export default exportStore;
