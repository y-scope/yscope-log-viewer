import * as Comlink from "comlink";
import dayjs from "dayjs";
import dayjsBigIntSupport from "dayjs/plugin/bigIntSupport";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsUtc from "dayjs/plugin/utc";

import {WrappedLogFileManager} from "./WrappedLogFileManager";


dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);
dayjs.extend(dayjsBigIntSupport);

/**
 * Manager for the currently opened log file.
 */
const wrappedLogFileManager = new WrappedLogFileManager();

Comlink.expose(wrappedLogFileManager);
