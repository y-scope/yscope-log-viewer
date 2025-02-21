import {
    ParsedKey,
    REPLACEMENT_CHARACTER,
} from "../typings/formatters";
import {
    parseKey,
    replaceDoubleBacklash,
} from "./formatters";


/**
 *
 * @param filterKey
 */
const escapeThenParseFilterKey = (
    filterKey: string,
): ParsedKey => {
    if (filterKey.includes(REPLACEMENT_CHARACTER)) {
        console.warn("Unicode replacement character `U+FFFD` is found in filter key" +
        ' String, which will be treated as "\\".');
    }
    filterKey = replaceDoubleBacklash(filterKey);

    return parseKey(filterKey);
};

export {escapeThenParseFilterKey};
