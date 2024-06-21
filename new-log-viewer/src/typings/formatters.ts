import {JsonObject} from "./js";


interface LogbackFormatOptionsType {
    formatString: string,
    timestampKey: string,
}

type FormatOptionsType = LogbackFormatOptionsType

type TimestampAndMessageType = [number, string]

interface Formatter {
    formatLogEvent: (jsonObject: JsonObject) => TimestampAndMessageType
}

export type {
    FormatOptionsType,
    Formatter,
    LogbackFormatOptionsType,
    TimestampAndMessageType,
};
