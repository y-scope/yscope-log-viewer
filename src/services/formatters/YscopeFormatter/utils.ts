import {Nullable} from "../../../typings/common";
import {
    AUTO_GENERATED_KEY_PREFIX,
    COLON_REGEX,
    DOUBLE_BACKSLASH,
    ParsedKey,
    PERIOD_REGEX,
    REPLACEMENT_CHARACTER,
    SINGLE_BACKSLASH,
    YscopeFieldFormatterMap,
    YscopeFieldPlaceholder,
} from "../../../typings/formatters";
import {JsonObject} from "../../../typings/js";
import {LogEvent} from "../../../typings/logs";
import {
    getNestedJsonValue,
    jsonValueToString,
} from "../../../utils/js";
import {StructuredIrNamespaceKeys} from "../../decoders/ClpIrDecoder/utils";
import {isJsonObject} from "../../decoders/JsonlDecoder/utils";
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
 * Removes all backslashes from a string. Purpose is to remove escape character preceding
 * other reserved characters.
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
 * @param str
 * @return Modified string.
 */
const replaceDoubleBacklash = (str: string): string => {
    return str.replaceAll(DOUBLE_BACKSLASH, REPLACEMENT_CHARACTER);
};

/**
 * Retrieves fields from auto-generated or user-generated namespace of a structured IR log
 * event based on the prefix of the parsed field name.
 *
 * @param logEvent
 * @param structuredIrNamespaceKeys
 * @param parsedFieldName
 * @return The extracted fields.
 * @throws {Error} If the namespace key is missing from structured IR log event or the
 * extracted fields are not a valid JsonObject.
 */
const getFieldsByNamespace = (
    logEvent: LogEvent,
    structuredIrNamespaceKeys: StructuredIrNamespaceKeys,
    parsedFieldName: ParsedKey
): JsonObject => {
    const namespaceKey = parsedFieldName.isAutoGenerated ?
        structuredIrNamespaceKeys.autoGenerated :
        structuredIrNamespaceKeys.userGenerated;
    const fields = logEvent.fields[namespaceKey];

    if ("undefined" === typeof fields) {
        throw new Error("Structured IR log event is missing namespace key");
    }
    if (false === isJsonObject(fields)) {
        throw new Error(
            "Fields from nested namespace in structured IR log event are not a valid JSON object"
        );
    }

    return fields;
};

/**
 * Gets a formatted field. Specifically, retrieves a field from a log event using a placeholder's
 * `parsedFieldName`. The field is then formatted using the placeholder's `fieldFormatter`.
 *
 * @param structuredIrNamespaceKeys
 * @param logEvent
 * @param fieldPlaceholder
 * @return The formatted field as a string.
 */
const getFormattedField = (
    structuredIrNamespaceKeys: Nullable<StructuredIrNamespaceKeys>,
    logEvent: LogEvent,
    fieldPlaceholder: YscopeFieldPlaceholder
): string => {
    const fields = null === structuredIrNamespaceKeys ?
        logEvent.fields :
        getFieldsByNamespace(logEvent, structuredIrNamespaceKeys, fieldPlaceholder.parsedFieldName);

    const nestedValue = getNestedJsonValue(fields, fieldPlaceholder.parsedFieldName.parts);

    if ("undefined" === typeof nestedValue) {
        return "";
    }

    return fieldPlaceholder.fieldFormatter ?
        fieldPlaceholder.fieldFormatter.formatField(nestedValue) :
        jsonValueToString(nestedValue);
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
 * Parses a key into its hierarchical components and determines if it is prefixed with
 * `AUTO_GENERATED_KEY_PREFIX`. If the prefix is present, it is removed.
 *
 * @param key The key to be parsed.
 * @return The parsed key.
 */
const parseKey = (key: string): ParsedKey => {
    const isAutoGenerated = AUTO_GENERATED_KEY_PREFIX === key.charAt(0);
    const keyWithoutAutoPrefix = isAutoGenerated ?
        key.substring(1) :
        key;
    const parts = keyWithoutAutoPrefix.split(PERIOD_REGEX).map(removeEscapeCharacters);

    return {
        isAutoGenerated,
        parts,
    };
};

/**
 * Splits a field placeholder string into its components: field name, formatter name, and
 * formatter options.
 *
 * @param placeholderString
 * @return - An object containing:
 * - fieldName: The field name.
 * - formatterName: The formatter name, or `null` if not provided.
 * - formatterOptions: The formatter options, or `null` if not provided.
 * @throws {Error} If the field name could not be parsed.
 */
const splitFieldPlaceholder = (
    placeholderString: string,
): {
    fieldName: string;
    formatterName: Nullable<string>;
    formatterOptions: Nullable<string>;
} => {
    let [
        fieldName,
        formatterName,
        formatterOptions,
    ]: Nullable<string | undefined>[
    ] = placeholderString.split(COLON_REGEX, 3);

    fieldName = validateComponent(fieldName);
    if (null === fieldName) {
        throw Error("Field name could not be parsed");
    }

    formatterName = validateComponent(formatterName);
    if (null !== formatterName) {
        formatterName = removeEscapeCharacters(formatterName);
    }

    formatterOptions = validateComponent(formatterOptions);
    if (null !== formatterOptions) {
        formatterOptions = removeEscapeCharacters(formatterOptions);
    }

    return {fieldName, formatterName, formatterOptions};
};


export {
    getFormattedField,
    parseKey,
    removeEscapeCharacters,
    replaceDoubleBacklash,
    splitFieldPlaceholder,
    YSCOPE_FIELD_FORMATTER_MAP,
};
