import useLogFileStore from "../../stores/logFileStore";
import useNotificationStore from "../../stores/notificationStore";
import useViewStore from "../../stores/viewStore";
import {LOG_LEVEL} from "../../typings/logs";
import {DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS} from "../../typings/notifications";
import type {PluginContext} from "../../typings/plugin";


const pluginContext: PluginContext = {
    getConfig: (pluginId, key) => window.localStorage.getItem(
        `plugin.${pluginId}.${key}`
    ),
    getFileName: () => useLogFileStore.getState().fileName,
    getFileSrc: () => useLogFileStore.getState().fileSrc,
    getLogEventNum: () => useViewStore.getState().logEventNum,
    navigateTo: (filePath, logEventNum) => {
        const url = new URL(window.location.href);
        url.search = `?filePath=${filePath}`;
        url.hash = logEventNum ?
            `#logEventNum=${logEventNum}` :
            "";
        window.location.assign(url.toString());
    },
    notify: (message, level = "info") => {
        const levelMap: Record<string, LOG_LEVEL> = {
            error: LOG_LEVEL.ERROR,
            info: LOG_LEVEL.INFO,
            warn: LOG_LEVEL.WARN,
        };

        useNotificationStore.getState().postPopUp({
            level: levelMap[level] ?? LOG_LEVEL.INFO,
            message: message,
            timeoutMillis: DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS,
            title: "Plugin notification",
        });
    },
    openInNewTab: (filePath, logEventNum) => {
        const url = new URL(window.location.href);
        url.search = `?filePath=${filePath}`;
        url.hash = logEventNum ?
            `#logEventNum=${logEventNum}` :
            "";
        window.open(url, "_blank");
    },
    setConfig: (pluginId, key, value) => {
        window.localStorage.setItem(`plugin.${pluginId}.${key}`, value);
    },
};

export default pluginContext;
