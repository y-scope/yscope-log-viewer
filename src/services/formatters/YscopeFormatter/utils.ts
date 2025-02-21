import {Nullable} from "../../../typings/common";
import {StructuredIrNamespaceKeys} from "../../../typings/decoders";
import {
    COLON_REGEX,
    ParsedKey,
    YscopeFieldFormatterMap,
    YscopeFieldPlaceholder,
} from "../../../typings/formatters";
import {JsonObject} from "../../../typings/js";
import {LogEvent} from "../../../typings/logs";
import {
    jsonValueToString,
    parseKey,
    removeEscapeCharacters,
    replaceDoubleBacklash,
} from "../../../utils/formatters";
import {getNestedJsonValue} from "../../../utils/js";
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
 * Retrieves the fields from the appropriate namespace of a structured IR log event based on the
 * prefix of the parsed key.
 *
 * @param logEvent
 * @param structuredIrNamespaceKeys
 * @param parsedKey
 * @returns The fields.
 * @throws {Error} If the namespace key is missing or the fields are not a valid JsonObject.
 */
const getFieldsByNamespace = (
    logEvent: LogEvent,
    structuredIrNamespaceKeys: StructuredIrNamespaceKeys,
    parsedKey: ParsedKey
): JsonObject => {
    const namespaceKey = parsedKey.hasAutoPrefix
        ? structuredIrNamespaceKeys.auto
        : structuredIrNamespaceKeys.user;
    const fields = logEvent.fields[namespaceKey];

    if (typeof fields === "undefined") {
        throw new Error("Structured IR log event is missing namespace key");
    }
    if (false == isJsonObject(fields)) {
        throw new Error(
            "Fields from nested namespace in structured IR log event are not a valid JSON object"
        );
    }

    return fields;
};

/**
 * Gets a formatted field. Specifically, retrieves a field from a log event using a placeholder's
 * `fieldNameKeys`. The field is then formatted using the placeholder's `fieldFormatter`.
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
    const fields = structuredIrNamespaceKeys === null
        ? logEvent.fields
        : getFieldsByNamespace(logEvent, structuredIrNamespaceKeys, fieldPlaceholder.parsedKey);

    const nestedValue = getNestedJsonValue(fields, fieldPlaceholder.parsedKey.splitKey);

    if (typeof nestedValue === "undefined") {
        return "";
    }

    return fieldPlaceholder.fieldFormatter
        ? fieldPlaceholder.fieldFormatter.formatField(nestedValue)
        : jsonValueToString(nestedValue);
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
 * @param structuredIrNamespaceKeys
 * @return - An object containing:
 * - hasAutoPrefix: Whether the field name is auto-generated.
 * - fieldNameKeys: An array of strings representing the field name split by periods.
 * - formatterName: The formatter name, or `null` if not provided.
 * - formatterOptions: The formatter options, or `null` if not provided.
 * @throws {Error} If the field name could not be parsed.
 */
const splitFieldPlaceholder = (placeholderString: string, structuredIrNamespaceKeys: Nullable<StructuredIrNamespaceKeys>): {
    parsedKey: ParsedKey;
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

    const parsedKey: ParsedKey = parseKey(fieldName);
    if (null === structuredIrNamespaceKeys && parsedKey.hasAutoPrefix) {
        throw new Error(
            "`@` is a reserved symbol in the format string and must be escaped with `\\` " +
            "for JSONL logs."
        );
    }

    formatterName = validateComponent(formatterName);
    if (null !== formatterName) {
        formatterName = removeEscapeCharacters(formatterName);
    }

    formatterOptions = validateComponent(formatterOptions);
    if (null !== formatterOptions) {
        formatterOptions = removeEscapeCharacters(formatterOptions);
    }

    return {parsedKey, formatterName, formatterOptions};
};


export {
    getFormattedField,
    jsonValueToString,
    removeEscapeCharacters,
    replaceDoubleBacklash,
    splitFieldPlaceholder,
    YSCOPE_FIELD_FORMATTER_MAP,
};
