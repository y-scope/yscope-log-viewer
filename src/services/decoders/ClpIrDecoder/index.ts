import clpFfiJsModuleInit, {
    ClpStreamReader,
    MainModule,
} from "clp-ffi-js/worker";
import {Dayjs} from "dayjs";

import {Nullable} from "../../../typings/common";
import {
    Decoder,
    DecodeResult,
    DecoderOptions,
    FilteredLogEventMap,
    LogEventCount,
    Metadata,
} from "../../../typings/decoders";
import {Formatter} from "../../../typings/formatters";
import {JsonObject} from "../../../typings/js";
import {LogLevelFilter} from "../../../typings/logs";
import YscopeFormatter from "../../formatters/YscopeFormatter";
import {
    convertToDayjsTimestamp,
    isJsonObject,
} from "../JsonlDecoder/utils";
import {parseFilterKeys} from "../utils";
import {
    CLP_IR_STREAM_TYPE,
    getStructuredIrNamespaceKeys,
    StructuredIrNamespaceKeys,
} from "./utils";


class ClpIrDecoder implements Decoder {
    #streamReader: ClpStreamReader;

    readonly #streamType: CLP_IR_STREAM_TYPE;

    readonly #structuredIrNamespaceKeys: StructuredIrNamespaceKeys;

    #formatter: Nullable<Formatter> = null;

    #timestampFormatString: string;

    constructor (
        ffiModule: MainModule,
        dataArray: Uint8Array,
        decoderOptions: DecoderOptions
    ) {
        const readerOptions = parseFilterKeys(decoderOptions, true);
        this.#streamReader = new ffiModule.ClpStreamReader(dataArray, readerOptions);
        this.#streamType =
            this.#streamReader.getIrStreamType() === ffiModule.IrStreamType.STRUCTURED ?
                CLP_IR_STREAM_TYPE.STRUCTURED :
                CLP_IR_STREAM_TYPE.UNSTRUCTURED;
        this.#structuredIrNamespaceKeys = getStructuredIrNamespaceKeys(ffiModule);
        this.#timestampFormatString = decoderOptions.timestampFormatString;

        if (this.#streamType === CLP_IR_STREAM_TYPE.STRUCTURED) {
            this.#formatter = new YscopeFormatter({
                formatString: decoderOptions.formatString,
                structuredIrNamespaceKeys: this.#structuredIrNamespaceKeys,
            });
        }
    }

    get irStreamType (): CLP_IR_STREAM_TYPE {
        return this.#streamType;
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
        return new ClpIrDecoder(module, dataArray, decoderOptions);
    }

    getEstimatedNumEvents (): number {
        return this.#streamReader.getNumEventsBuffered();
    }

    getFilteredLogEventMap (): FilteredLogEventMap {
        return this.#streamReader.getFilteredLogEventMap();
    }

    getMetadata (): Metadata {
        return this.#streamReader.getMetadata();
    }

    findNearestLogEventByTimestamp (timestamp: number): Nullable<number> {
        return this.#streamReader.findNearestLogEventByTimestamp(BigInt(timestamp));
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter, kqlFilter: string): boolean {
        try {
            this.#streamReader.filterLogEvents(logLevelFilter, kqlFilter);
        } catch (err: unknown) {
            throw new Error("Failed to execute the KQL query.", {cause: err});
        }

        return true;
    }

    build (): LogEventCount {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#streamReader.deserializeStream(),
        };
    }

    setFormatterOptions (options: DecoderOptions): boolean {
        this.#formatter = new YscopeFormatter({
            formatString: options.formatString,
            structuredIrNamespaceKeys: this.#structuredIrNamespaceKeys,
        });

        return true;
    }

    /**
     * See {@link Decoder.decodeRange}.
     *
     * @param beginIdx
     * @param endIdx
     * @param useFilter
     * @return
     * @throws {Error} if the formatter is not set for structured logs.
     */
    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResult[]> {
        const results =
            this.#streamReader.decodeRange(beginIdx, endIdx, useFilter);

        if (null === results) {
            return null;
        }

        if (null === this.#formatter) {
            if (this.#streamType === CLP_IR_STREAM_TYPE.STRUCTURED) {
                // eslint-disable-next-line no-warning-comments
                // TODO: Revisit when we allow displaying structured logs without a formatter.
                throw new Error("Formatter is not set for structured logs.");
            }

            return this.#formatUnstructuredResults(results);
        }

        for (const r of results) {
            const {
                message,
                timestamp,
                logLevel,
            } = r;
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

            r.message = this.#formatter.formatLogEvent({
                fields: fields,
                level: logLevel,
                timestamp: dayJsTimestamp,
            });
        }

        return results;
    }

    /**
     * Formats unstructured log events by prepending a formatted timestamp to each message.
     *
     * @param logEvents
     * @return The formatted log events.
     */
    #formatUnstructuredResults (logEvents: DecodeResult[]): Nullable<DecodeResult[]> {
        for (const r of logEvents) {
            const {
                message, timestamp,
            } = r;

            const formattedTimestamp = convertToDayjsTimestamp(timestamp).format(
                this.#timestampFormatString
            );

            r.message = formattedTimestamp + message;
        }

        return logEvents;
    }
}


export default ClpIrDecoder;
