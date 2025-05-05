import * as Comlink from "comlink";
import {create} from "zustand";

import {LogFileManagerProxy} from "../../services/LogFileManagerProxy";


interface LogFileManagerProxyState {
    logFileManagerProxy: Comlink.Remote<LogFileManagerProxy>;
}

const useLogFileManagerStore = create<LogFileManagerProxyState>()(() => {
    const mainWorker = new Worker(new URL("../../services/MainWorker.ts", import.meta.url));
    return {
        logFileManagerProxy: Comlink.wrap(mainWorker),
    };
});

export default useLogFileManagerStore;
