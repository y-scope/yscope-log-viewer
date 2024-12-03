import clpFfiJsModuleInit, {ClpStreamReader} from "clp-ffi-js";
import {Dayjs} from "dayjs";

import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResult,
    DecoderOptions,
    FilteredLogEventMap,
    LogEventCount,
} from "../../typings/decoders";
import {Formatter} from "../../typings/formatters";
import {JsonObject} from "../../typings/js";
import {LogLevelFilter} from "../../typings/logs";
import YscopeFormatter from "../formatters/YscopeFormatter";
import {postFormatPopup} from "../MainWorker";
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

    readonly #streamType: CLP_IR_STREAM_TYPE;

    #formatter: Nullable<Formatter> = null;

    constructor (
        streamType: CLP_IR_STREAM_TYPE,
        streamReader: ClpStreamReader,
        decoderOptions: DecoderOptions
    ) {
        this.#streamType = streamType;
        this.#streamReader = streamReader;
        if (streamType === CLP_IR_STREAM_TYPE.STRUCTURED) {
            this.#formatter = new YscopeFormatter({formatString: decoderOptions.formatString});
            if (0 === decoderOptions.formatString.length) {
                postFormatPopup();
            }
        }
    }

    /**
     * Creates a new ClpIrDecoder instance.
     * NOTE: `decoderOptions` only affects decode results if the stream type is
     * {@link CLP_IR_STREAM_TYPE.STRUCTURED}.
     *
     * @param dataArray The input data array to be passed to the decoder.
     * @param decoderOptions
     * @return The created ClpIrDecoder instance.
     */
    static async create (
        dataArray: Uint8Array,
        decoderOptions: DecoderOptions
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

    setFormatterOptions (options: DecoderOptions): boolean {
        this.#formatter = new YscopeFormatter({formatString: options.formatString});

        return true;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResult[]> {
        const results: DecodeResult[] =
            this.#streamReader.decodeRange(beginIdx, endIdx, useFilter);

        if (null === this.#formatter) {
            if (this.#streamType === CLP_IR_STREAM_TYPE.STRUCTURED) {
                // eslint-disable-next-line no-warning-comments
                // TODO: Revisit when we allow displaying structured logs without a formatter.
                console.error("Formatter is not set for structured logs.");
            }

            return results;
        }

        for (const r of results) {
            const [
                message,
                timestamp,
                level,
            ] = r;
            const dayJsTimestamp: Dayjs = convertToDayjsTimestamp(timestamp);
            let fields: JsonObject = {};

            try {
                fields = JSON.parse(message) as JsonObject;
                if (false === isJsonObject(fields)) {
                    throw new Error("Unexpected non-object.");
                }
            } catch (e) {
                console.error(e, message);
            }

            r[0] = this.#formatter.formatLogEvent({
                fields: fields,
                level: level,
                timestamp: dayJsTimestamp,
            });
        }

        return results;
    }
}


export default ClpIrDecoder;
