import {Nullable} from "../../../typings/common";
import {
    COLON_REGEX,
    DOUBLE_BACKSLASH,
    PERIOD_REGEX,
    REPLACEMENT_CHARACTER,
    SINGLE_BACKSLASH,
    YscopeFieldFormatterMap,
    YscopeFieldPlaceholder,
} from "../../../typings/formatters";
import {JsonValue} from "../../../typings/js";
import {LogEvent} from "../../../typings/logs";
import {getNestedJsonValue} from "../../../utils/js";
import RoundFormatter from "./FieldFormatters/RoundFormatter";
import TimestampFormatter from "./FieldFormatters/TimestampFormatter";


/**
 * List of currently supported field formatters.
 */
const YSCOPE_FIELD_FORMATTER_MAP: YscopeFieldFormatterMap = Object.freeze({
    timestamp: TimestampFormatter,
    round: RoundFormatter,
});


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
 * Gets a formatted field. Specifically, retrieves a field from a log event using a placeholder's
 * `fieldNameKeys`. The field is then formatted using the placeholder's `fieldFormatter`.
 *
 * @param logEvent
 * @param fieldPlaceholder
 * @return The formatted field as a string.
 */
const getFormattedField = (
    logEvent: LogEvent,
    fieldPlaceholder: YscopeFieldPlaceholder
): string => {
    const nestedValue = getNestedJsonValue(logEvent.fields, fieldPlaceholder.fieldNameKeys);
    if ("undefined" === typeof nestedValue) {
        return "";
    }

    const formattedField = fieldPlaceholder.fieldFormatter ?
        fieldPlaceholder.fieldFormatter.formatField(nestedValue) :
        jsonValueToString(nestedValue);

    return formattedField;
};

/**
 * Validates a component string.
 *
 * @param component
 * @return The component string if valid, or `null` if the component is undefined or empty.
 */
const validateComponent = (component: string | undefined): Nullable<string> => {
    if ("undefined" === typeof component || 0 === component.length) {
        return null;
    }

    return component;
};

/**
 * Splits a field placeholder string into its components: field name, formatter name, and formatter
 * options.
 *
 * @param placeholderString
 * @return - An object containing:
 * - fieldNameKeys: An array of strings representing the field name split by periods.
 * - formatterName: The formatter name, or `null` if not provided.
 * - formatterOptions: The formatter options, or `null` if not provided.
 * @throws {Error} If the field name could not be parsed.
 */
const splitFieldPlaceholder = (placeholderString: string): {
    fieldNameKeys: string[],
    formatterName: Nullable<string>,
    formatterOptions: Nullable<string>,
} => {
    let [
        fieldName,
        formatterName,
        formatterOptions,
    ]: Nullable<string|undefined>[
] = placeholderString.split(COLON_REGEX, 3);

    fieldName = validateComponent(fieldName);
    if (null === fieldName) {
        throw Error("Field name could not be parsed");
    }

    // Splits field name into an array of field name keys to support nested fields.
    let fieldNameKeys = fieldName.split(PERIOD_REGEX);

    fieldNameKeys = fieldNameKeys.map((key) => removeEscapeCharacters(key));

    formatterName = validateComponent(formatterName);
    if (null !== formatterName) {
        formatterName = removeEscapeCharacters(formatterName);
    }

    formatterOptions = validateComponent(formatterOptions);
    if (null !== formatterOptions) {
        formatterOptions = removeEscapeCharacters(formatterOptions);
    }

    return {fieldNameKeys, formatterName, formatterOptions};
};


export {
    getFormattedField,
    jsonValueToString,
    removeEscapeCharacters,
    replaceDoubleBacklash,
    splitFieldPlaceholder,
    YSCOPE_FIELD_FORMATTER_MAP,
};
