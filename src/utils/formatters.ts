import {
    DOUBLE_BACKSLASH,
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
 * Replaces all replacement characters with a single backslash. Purpose is to remove, albeit
 * indirectly through intermediate replacement character, escape character in front of a backslash
 * character.
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
 * Replaces all escaped backslashes with replacement character. Replacement character is a rare
 * character that is unlikely to be in user string. Writing regex to distinguish between
 * a single escape character ("\") and an escaped backslash ("\\") is challenging especially
 * when they are in series. It is simpler to just replace escaped backslashes with a rare character
 * and add them back after parsing user string with regex is finished.
 *
 * @param string
 * @return Modified string.
 */
const replaceDoubleBacklash = (string: string): string => {
    return string.replaceAll(DOUBLE_BACKSLASH, REPLACEMENT_CHARACTER);
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


export {
    jsonValueToString,
    removeEscapeCharacters,
    replaceDoubleBacklash,
};
