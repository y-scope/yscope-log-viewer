import * as Comlink from "comlink";
import {create} from "zustand";

import {WrappedLogFileManager} from "../../services/WrappedLogFileManager";


interface LogFileManagerState {
    wrappedLogFileManager: Comlink.Remote<WrappedLogFileManager>;
}

const useLogFileManagerStore = create<LogFileManagerState>()(() => {
    const mainWorker = new Worker(new URL("../../services/MainWorker.ts", import.meta.url));
    return {
        wrappedLogFileManager: Comlink.wrap(mainWorker),
    };
});

export default useLogFileManagerStore;
