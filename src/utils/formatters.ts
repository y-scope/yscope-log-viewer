import {
    DOUBLE_BACKSLASH,
    AUTO_GENERATED_KEY_PREFIX,
    ParsedKey,
    PERIOD_REGEX,
    REPLACEMENT_CHARACTER,
    SINGLE_BACKSLASH,
} from "../typings/formatters";
import {JsonValue} from "../typings/js";


/**
 * Removes all backslashes from a string. Purpose is to remove escape character in front of brace
 * and colon characters.
 *
 * @param str
 * @return Modified string.
 */
const removeBackslash = (str: string): string => {
    return str.replaceAll(SINGLE_BACKSLASH, "");
};

/**
 * Replaces all replacement characters in format string with a single backslash. Purpose is to
 * remove, albeit indirectly through intermediate replacement character, escape character in
 * front of a backslash character.
 *
 * @param str
 * @return Modified string.
 */
const replaceReplacementCharacter = (str: string): string => {
    return str.replaceAll(REPLACEMENT_CHARACTER, "\\");
};

/**
 * Removes escape characters from a string.
 *
 * @param str
 * @return Modified string.
 */
const removeEscapeCharacters = (str: string): string => {
    // `removeBackslash()`, which removes all  backlashes, is called before
    // `replaceReplacementCharacter()` to prevent removal of escaped backslashes.
    return replaceReplacementCharacter(removeBackslash(str));
};

/**
 * Replaces all escaped backslashes in format string with replacement character.
 * Replacement character is a rare character that is unlikely to be in user format string.
 * Writing regex to distinguish between a single escape character ("\") and an escaped backslash
 * ("\\") is challenging especially when they are in series. It is simpler to just replace
 * escaped backslashes with a rare character and add them back after parsing field placeholder
 * with regex is finished.
 *
 * @param formatString
 * @return Modified format string.
 */
const replaceDoubleBacklash = (formatString: string): string => {
    return formatString.replaceAll(DOUBLE_BACKSLASH, REPLACEMENT_CHARACTER);
};


/**
 * Converts a JSON value to its string representation.
 *
 * @param input
 * @return
 */
const jsonValueToString = (input: JsonValue | undefined): string => {
    // Behaviour is different for `undefined`.
    return "object" === typeof input ?
        JSON.stringify(input) :
        String(input);
};


/**
 *
 * @param filterKey
 */
const parseFieldName = (
    filterKey: string,
): ParsedKey => {
    const hasAutoPrefix = AUTO_GENERATED_KEY_PREFIX === filterKey.charAt(0);
    if (hasAutoPrefix) {
        filterKey = filterKey.substring(1);
    }
    let splitKey = filterKey.split(PERIOD_REGEX);
    splitKey = splitKey.map((key) => removeEscapeCharacters(key));
    return {
        hasAutoPrefix: hasAutoPrefix,
        splitKey: splitKey,
    };
};

/**
 *
 * @param filterKey
 */
const parseFilterKey = (
    filterKey: string,
): ParsedKey => {
    if (filterKey.includes(REPLACEMENT_CHARACTER)) {
        console.warn("Unicode replacement character `U+FFFD` is found in filter key" +
        ' String, which will be treated as "\\".');
    }
    filterKey = replaceDoubleBacklash(filterKey);
    return parseFieldName(filterKey);
};

export {
    jsonValueToString,
    parseFieldName,
    parseFilterKey,
    removeEscapeCharacters,
    replaceDoubleBacklash,
};
