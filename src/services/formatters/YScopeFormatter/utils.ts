import {Nullable} from "../../../typings/common";
import {
    BACKSLASH_REGEX,
    COLON_REGEX,
    PERIOD_REGEX,
    YScopeFieldFormatterMap,
} from "../../../typings/formatters";
import {JsonValue} from "../../../typings/js";
import RoundFormatter from "./FieldFormatters/RoundFormatter";
import TimestampFormatter from "./FieldFormatters/TimestampFormatter";


/**
 * List of currently supported field formatters.
 */
const YSCOPE_FORMATTERS_MAP: YScopeFieldFormatterMap = Object.freeze({
    timestamp: TimestampFormatter,
    round: RoundFormatter,
});

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
 * Splits a field placeholder into its components: field name, formatter name, and formatter
 * options.
 *
 * @param fieldPlaceholder
 * @return - An object containing:
 * - fieldNameKeys: An array of strings representing the field name split by periods.
 * - formatterName: The formatter name, or `null` if not provided.
 * - formatterOptions: The formatter options, or `null` if not provided.
 * @throws {Error} If the field name could not be parsed.
 */
const splitFieldPlaceholder = (fieldPlaceholder: string): {
    fieldNameKeys: string[],
    formatterName: Nullable<string>,
    formatterOptions: Nullable<string>,
} => {
    let [fieldName,
        formatterName,
        formatterOptions]: Nullable<string|undefined>[] = fieldPlaceholder.split(COLON_REGEX, 3);

    fieldName = validateComponent(fieldName);
    if (null === fieldName) {
        throw Error("Field name could not be parsed");
    }
    let fieldNameKeys = fieldName.split(PERIOD_REGEX);

    const pattern = new RegExp(BACKSLASH_REGEX, "g");

    // Remove escape characters (`\`) after the field name is split.
    fieldNameKeys = fieldNameKeys.map((key) => key.replaceAll(pattern, ""));

    formatterName = validateComponent(formatterName);
    if (null !== formatterName) {
        formatterName = formatterName.replaceAll(pattern, "");
    }

    formatterOptions = validateComponent(formatterOptions);
    if (null !== formatterOptions) {
        formatterOptions = formatterOptions.replaceAll(pattern, "");
    }
    console.log(formatterOptions);

    return {fieldNameKeys, formatterName, formatterOptions};
};


export {
    jsonValueToString,
    splitFieldPlaceholder,
    YSCOPE_FORMATTERS_MAP,
};
