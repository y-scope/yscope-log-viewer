import clpFfiJsModuleInit, {ClpIrStreamReader} from "../../../deps/ClpFfiJs";
import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResultType,
    JsonlDecoderOptionsType,
    LogEventCount,
} from "../../typings/decoders";
import {Formatter} from "../../typings/formatters";
import {JsonObject} from "../../typings/js";
import {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
} from "../../typings/logs";
import LogbackFormatter from "../formatters/LogbackFormatter";


class ClpIrV2Decoder implements Decoder {
    #streamReader: ClpIrStreamReader;

    #logLevelKey: string = "level";

    #logEvents: JsonObject[] = [];

    #formatter: Formatter;


    constructor (streamReader: ClpIrStreamReader, decoderOptions: JsonlDecoderOptionsType) {
        this.#streamReader = streamReader;
        this.#formatter = new LogbackFormatter(decoderOptions);
    }

    /**
     * Creates a new ClpIrV2Decoder instance.
     *
     * @param dataArray The input data array to be passed to the decoder.
     * @param decoderOptions
     * @return The created ClpIrV2Decoder instance.
     */
    static async create (dataArray: Uint8Array, decoderOptions: JsonlDecoderOptionsType): Promise<ClpIrV2Decoder> {
        const module = await clpFfiJsModuleInit();
        const streamReader = new module.ClpIrStreamReader(dataArray);
        return new ClpIrV2Decoder(streamReader, decoderOptions);
    }

    getEstimatedNumEvents (): number {
        return this.#streamReader.getNumEventsBuffered();
    }

    buildIdx (beginIdx: number, endIdx: number): Nullable<LogEventCount> {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#streamReader.deserializeRange(beginIdx, endIdx),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    setDecoderOptions (): boolean {
        return true;
    }

    decode (beginIdx: number, endIdx: number): Nullable<DecodeResultType[]> {
        if ([
            typeof this.#logEvents[beginIdx],
            typeof this.#logEvents[endIdx],
        ].includes("undefined")) {
            const results = this.#streamReader.decodeRange(beginIdx, endIdx);
            results.forEach(([jsonString, logEventIdx]) => {
                this.#logEvents[logEventIdx] = JSON.parse(jsonString) as JsonObject;
            });
        }

        const results: DecodeResultType[] = [];
        for (let logEventIdx = beginIdx; logEventIdx < endIdx; logEventIdx++) {
            let timestamp: number;
            let message: string;
            let logLevel: LOG_LEVEL;

            const logEvent = this.#logEvents[logEventIdx];
            if ("undefined" === typeof logEvent) {
                timestamp = INVALID_TIMESTAMP_VALUE;
                message = "{}\n";
                logLevel = LOG_LEVEL.NONE;
            } else {
                // Explicit cast since typescript thinks `#logEvents[logEventIdx]` can be undefined,
                // but it shouldn't be since we performed a bounds check at the beginning of the
                // method.
                (
                    {timestamp, message} = this.#formatter.formatLogEvent(logEvent)
                );
                logLevel = this.#parseLogLevel(logEvent);
            }
            results.push([
                message,
                timestamp,
                logLevel,
                logEventIdx + 1,
            ]);
        }

        return results;
    }

    /**
     * Parses the log level from the given log event.
     *
     * @param logEvent
     * @return The parsed log level.
     */
    #parseLogLevel (logEvent: JsonObject): number {
        let logLevel = LOG_LEVEL.NONE;

        const parsedLogLevel = logEvent[this.#logLevelKey];
        if ("undefined" === typeof parsedLogLevel) {
            console.error(`${this.#logLevelKey} doesn't exist in log event.`);

            return logLevel;
        }

        const logLevelStr = "object" === typeof parsedLogLevel ?
            JSON.stringify(parsedLogLevel) :
            String(parsedLogLevel);

        if (false === (logLevelStr.toUpperCase() in LOG_LEVEL)) {
            console.error(`${logLevelStr} doesn't match any known log level.`);
        } else {
            logLevel = LOG_LEVEL[logLevelStr as (keyof typeof LOG_LEVEL)];
        }

        return logLevel;
    }
}

export default ClpIrV2Decoder;
