import {
    ParsedKey,
    REPLACEMENT_CHARACTER,
} from "../typings/formatters";
import {
    parseKey,
    replaceDoubleBacklash,
} from "./formatters";


/**
 * Preprocesses filter key to facilitate parsing, then parses the key.
 *
 * @param filterKey - The key to be processed and parsed.
 * @returns The parsed key object.
 */
const processThenParseFilterKey = (filterKey: string): ParsedKey => {
    if (filterKey.includes(REPLACEMENT_CHARACTER)) {
        console.warn("Unicode replacement character `U+FFFD` found in filter key; " +
            `it will be replaced with "\\"`);
    }
    return parseKey(replaceDoubleBacklash(filterKey));
};

export {processThenParseFilterKey};
