import clpFfiJsModuleInit, {ClpStreamReader} from "clp-ffi-js";

import {Nullable} from "../../typings/common";
import {
    ClpIrDecoderOptions,
    Decoder,
    DecodeResultType,
    FilteredLogEventMap,
    JsonlDecoderOptions,
    LogEventCount,
} from "../../typings/decoders";
import {Formatter} from "../../typings/formatters";
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


enum CLP_IR_STREAM_TYPE {
    STRUCTURED = "structured",
    UNSTRUCTURED = "unstructured",
}

class ClpIrDecoder implements Decoder {
    #streamReader: ClpStreamReader;

    #streamType: CLP_IR_STREAM_TYPE;

    #formatter: Nullable<Formatter>;

    constructor (
        streamType: CLP_IR_STREAM_TYPE,
        streamReader: ClpStreamReader,
        decoderOptions: ClpIrDecoderOptions
    ) {
        this.#streamType = streamType;
        this.#streamReader = streamReader;
        this.#formatter = (streamType === CLP_IR_STREAM_TYPE.STRUCTURED) ?
            new LogbackFormatter({formatString: decoderOptions.formatString}) :
            null;
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
        const streamType = streamReader.getIrStreamType() === module.IrStreamType.STRUCTURED ?
            CLP_IR_STREAM_TYPE.STRUCTURED :
            CLP_IR_STREAM_TYPE.UNSTRUCTURED;

        return new ClpIrDecoder(streamType, streamReader, decoderOptions);
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

    setFormatterOptions (options: JsonlDecoderOptions): boolean {
        this.#formatter = new LogbackFormatter({formatString: options.formatString});

        return true;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResultType[]> {
        const results = this.#streamReader.decodeRange(beginIdx, endIdx, useFilter);
        if (this.#streamType === CLP_IR_STREAM_TYPE.UNSTRUCTURED) {
            return results;
        }
        results.forEach((result) => {
            const [message, timestamp] = result;
            let fields: JsonObject = {};

            if (0 < message.length) {
                try {
                    fields = JSON.parse(message) as JsonObject;
                    if (false === isJsonObject(fields)) {
                        throw new Error("Unexpected non-object.");
                    }
                } catch (e) {
                    console.error(e, message);
                }
            }

            // `this.#formatter` has been null-checked at the method entry.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result[0] = this.#formatter!.formatLogEvent({
                fields: fields,
                level: LOG_LEVEL.UNKNOWN,
                timestamp: convertToDayjsTimestamp(timestamp),
            });
        });

        return results;
    }
}


export default ClpIrDecoder;
