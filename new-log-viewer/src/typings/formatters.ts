import {JsonObject} from "./js";


interface LogbackFormatterOptionsType {
    formatString: string,
    timestampKey: string,
}

type FormatterOptionsType = LogbackFormatterOptionsType

type TimestampAndMessageType = [number, string]

interface Formatter {
    formatLogEvent: (jsonObject: JsonObject) => TimestampAndMessageType
}

export type {
    Formatter,
    FormatterOptionsType,
    LogbackFormatterOptionsType,
    TimestampAndMessageType,
};
