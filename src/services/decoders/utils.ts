import {DecoderOptions} from "../../typings/decoders";
import {
    ParsedKey,
    REPLACEMENT_CHARACTER,
} from "../../typings/formatters";
import {
    EXISTING_REPLACEMENT_CHARACTER_WARNING,
    parseKey,
    replaceDoubleBacklash,
    UNEXPECTED_AUTOGENERATED_SYMBOL_ERROR_MESSAGE,
} from "../formatters/YscopeFormatter/utils";


/**
 * Preprocesses filter key by removing escaped backlash to facilitate simpler parsing, then parses
 * the key.
 *
 * @param filterKey
 * @return The parsed key.
 */
const preprocessThenParseFilterKey = (filterKey: string): ParsedKey => {
    if (filterKey.includes(REPLACEMENT_CHARACTER)) {
        console.warn(EXISTING_REPLACEMENT_CHARACTER_WARNING);
    }

    return parseKey(replaceDoubleBacklash(filterKey));
};

/**
 * Parses the log level key and timestamp key from the decoder options.
 *
 * @param decoderOptions
 * @param supportsAutoGeneratedKeys
 * @return An object containing the parsed log level key and timestamp key.
 * @throws {Error} If the keys contain reserved symbols.
 */
const parseFilterKeys = (decoderOptions: DecoderOptions, supportsAutoGeneratedKeys: boolean): {
    logLevelKey: ParsedKey;
    timestampKey: ParsedKey;
} => {
    const parsedLogLevelKey = preprocessThenParseFilterKey(decoderOptions.logLevelKey);
    const parsedTimestampKey = preprocessThenParseFilterKey(decoderOptions.timestampKey);

    if (false === supportsAutoGeneratedKeys &&
        (parsedLogLevelKey.isAutoGenerated || parsedTimestampKey.isAutoGenerated)) {
        throw new Error(UNEXPECTED_AUTOGENERATED_SYMBOL_ERROR_MESSAGE);
    }

    return {
        logLevelKey: parsedLogLevelKey,
        timestampKey: parsedTimestampKey,
    };
};

export {
    parseFilterKeys,
    preprocessThenParseFilterKey,
};
