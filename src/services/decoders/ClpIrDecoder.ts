import clpFfiJsModuleInit, {ClpStreamReader} from "../../../deps/ClpFfiJs-worker";
import {Nullable} from "../../typings/common";
import {
    ClpIrDecoderOptions,
    Decoder,
    DecodeResultType,
    FilteredLogEventMap,
    LogEventCount,
} from "../../typings/decoders";
import {JsonObject} from "../../typings/js";
import {
    LOG_LEVEL,
    LogLevelFilter,
} from "../../typings/logs";
import LogbackFormatter from "../formatters/LogbackFormatter";
import {
    convertToDayjsTimestamp,
    isJsonObject,
} from "./JsonlDecoder/utils";


class ClpIrDecoder implements Decoder {
    #streamReader: ClpStreamReader;

    #formatter: Nullable<LogbackFormatter>;

    #logLevelKey: Nullable<string>;

    constructor (streamReader: ClpStreamReader, formatter: Nullable<LogbackFormatter>, logLevelKey: Nullable<string>) {
        this.#streamReader = streamReader;
        this.#formatter = formatter;
        this.#logLevelKey = logLevelKey;
    }

    /**
     * Creates a new ClpIrDecoder instance.
     *
     * @param dataArray The input data array to be passed to the decoder.
     * @param decoderOptions
     * @return The created ClpIrDecoder instance.
     */
    static async create (
        dataArray: Uint8Array,
        decoderOptions: ClpIrDecoderOptions
    ): Promise<ClpIrDecoder> {
        const module = await clpFfiJsModuleInit();
        const streamReader = new module.ClpStreamReader(dataArray, decoderOptions);

        let formatter: Nullable<LogbackFormatter> = null;
        let logLevelKey: Nullable<string> = null;
        if (
            module.IRProtocolErrorCode.SUPPORTED === streamReader.getIrProtocolErrorCode()
        ) {
            formatter = new LogbackFormatter({formatString: decoderOptions.formatString});
            ({logLevelKey} = decoderOptions);
        }

        return new ClpIrDecoder(streamReader, formatter, logLevelKey);
    }

    getEstimatedNumEvents (): number {
        return this.#streamReader.getNumEventsBuffered();
    }

    getFilteredLogEventMap (): FilteredLogEventMap {
        return this.#streamReader.getFilteredLogEventMap();
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        this.#streamReader.filterLogEvents(logLevelFilter);

        return true;
    }

    build (): LogEventCount {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#streamReader.deserializeStream(),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    setFormatterOptions (): boolean {
        return true;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResultType[]> {
        const results = this.#streamReader.decodeRange(beginIdx, endIdx, useFilter);
        if (null === this.#formatter) {
            return results;
        }
        results.forEach((result) => {
            const [message, timestamp] = result;
            let fields: JsonObject = {};
            try {
                fields = JSON.parse(message) as JsonObject;
                if (false === isJsonObject(fields)) {
                    throw new Error("Unexpected non-object.");
                } else if (null !== this.#logLevelKey) {
                    const logLevel = fields[this.#logLevelKey];
                    fields[this.#logLevelKey] = LOG_LEVEL[logLevel as LOG_LEVEL];
                }
            } catch (e) {
                if (0 === message.length) {
                    return;
                }
                console.error(e, message);
            }

            // @ts-expect-error `this.#formatter` is certainly non-null
            result[0] = this.#formatter.formatLogEvent({
                fields: fields,
                timestamp: convertToDayjsTimestamp(timestamp),
            });
        });

        return results;
    }
}

export default ClpIrDecoder;
