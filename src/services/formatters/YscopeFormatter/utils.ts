import {Nullable} from "../../../typings/common";
import {
    COLON_REGEX,
    ParsedKey,
    YscopeFieldFormatterMap,
    YscopeFieldPlaceholder,
} from "../../../typings/formatters";
import {
    StructuredIrNamespaceKeys
} from "../../../typings/decoders";
import {LogEvent} from "../../../typings/logs";
import {JsonObject} from "../../../typings/js";
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


const getLogEventFields = (logEvent: LogEvent, structuredIrNamespaceKeys: Nullable<StructuredIrNamespaceKeys>, hasAutoPrefix: boolean): JsonObject => {
    if (null === structuredIrNamespaceKeys) {
        return logEvent.fields
    }
    const namespaceKey = hasAutoPrefix ?
        structuredIrNamespaceKeys.auto :
        structuredIrNamespaceKeys.user;
    const nestedFields = logEvent.fields[namespaceKey];
    if ("undefined" === typeof nestedFields) {
        throw new Error("Structured IR log event is missing namespace key");
    }
    if (false === isJsonObject(nestedFields)) {
        throw new Error("Structured IR log event is corrupted");
    }
    return nestedFields
}

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

    let fields: JsonObject;
    if (null === structuredIrNamespaceKeys) {
        fields = logEvent.fields;
    } else {
        fields = getLogEventFields(
            logEvent,
            structuredIrNamespaceKeys,
            fieldPlaceholder.parsedKey.hasAutoPrefix);
    }

    const nestedValue = getNestedJsonValue(
        fields,
        fieldPlaceholder.fieldNameKeys
    );
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
