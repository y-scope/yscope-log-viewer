import {Dayjs} from "dayjs";

import {Nullable} from "./common";
import {JsonObject} from "./js";


enum LOG_LEVEL {
    NONE = 0,
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL
}

type LogLevelFilter = Nullable<LOG_LEVEL[]>;

interface JsonLogEvent {
    timestamp: Dayjs,
    level: LOG_LEVEL,
    fields: JsonObject
}

const INVALID_TIMESTAMP_VALUE = 0;

export type {
    JsonLogEvent,
    LogLevelFilter,
};
export {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
};
