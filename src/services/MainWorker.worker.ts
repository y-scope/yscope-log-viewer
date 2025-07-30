import * as Comlink from "comlink";
import dayjs from "dayjs";
import dayjsBigIntSupport from "dayjs/plugin/bigIntSupport";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsUtc from "dayjs/plugin/utc";

import LogFileManager from "./LogFileManager";


dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);
dayjs.extend(dayjsBigIntSupport);

/**
 * Manager for the currently opened log file.
 */
const api = {
    create: (...args: Parameters<typeof LogFileManager.create>) => LogFileManager.create(...args),
};

Comlink.expose(api);
