import * as Comlink from "comlink";
import {create} from "zustand";

import {LogFileManagerProxy} from "../services/LogFileManagerProxy";
import MainWorker from "../services/MainWorker.worker?worker";


interface LogFileManagerProxyState {
    logFileManagerProxy: Comlink.Remote<LogFileManagerProxy>;
}

const useLogFileManagerProxyStore = create<LogFileManagerProxyState>(() => {
    const mainWorker = new MainWorker();
    return {
        logFileManagerProxy: Comlink.wrap(mainWorker),
    };
});

export default useLogFileManagerProxyStore;
