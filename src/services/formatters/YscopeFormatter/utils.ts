import {Nullable} from "../../../typings/common";
import {
    COLON_REGEX,
    PERIOD_REGEX,
    YscopeFieldFormatterMap,
    YscopeFieldPlaceholder,
} from "../../../typings/formatters";
import {LogEvent} from "../../../typings/logs";
import {
    jsonValueToString,
    removeEscapeCharacters,
} from "../../../utils/formatters";
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
    fieldNameKeys: string[];
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
    splitFieldPlaceholder,
    YSCOPE_FIELD_FORMATTER_MAP,
};
