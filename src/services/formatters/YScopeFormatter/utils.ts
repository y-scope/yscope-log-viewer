import {
    YScopeFieldFormatterMap,
} from "../../../typings/formatters";
import {Nullable} from "../../../typings/common";

import TimestampFormatter from "./FieldFormatters/TimestampFormatter";
import RoundFormatter from "./FieldFormatters/RoundFormatter"
import {JsonValue} from "../../../typings/js";

const YSCOPE_FORMATTERS_MAP: YScopeFieldFormatterMap = Object.freeze({
    timestamp: TimestampFormatter,
    round: RoundFormatter,
});

/**
 * Converts a JSON value to its string representation.
 *
 * @param input
 * @returns
 */
const jsonValueToString = (input: JsonValue | undefined): string => {
    return  "object" === typeof input ? JSON.stringify(input) : String(input);
}

/**
 * Validates a subfield string.
 * @param subfield
 * @returns The subfield string if valid, or `null` if the subfield is undefined or empty.
*/
const validateSubfield = (subfield: string | undefined): Nullable<string> => {
    if ("undefined" === typeof subfield || subfield.length === 0) {
        return null;
    }
    return subfield;
}

/**
 * Splits a field placeholder into its components: field name, formatter name, and formatter options.
 * @param fieldPlaceholder
 * @returns - An object containing:
 *   - fieldNameKeys: An array of strings representing the field name split by periods.
 *   - formatterName: The formatter name, or `null` if not provided.
 *   - formatterOptions: The formatter options, or `null` if not provided.
 * @throws {Error} If the field name could not be parsed.
 */
const splitFieldPlaceholder = (fieldPlaceholder: string): {
    fieldNameKeys: string[],
    formatterName: Nullable<string>,
    formatterOptions: Nullable<string>,
} => {

    let [fieldName, formatterName, formatterOptions]: Nullable<string|undefined>[] = fieldPlaceholder.split(COLON_REGEX,3);
    fieldName = validateSubfield(fieldName);
    if (null === fieldName) {
        throw Error ("Field name could not be parsed")
    }
    let fieldNameKeys = fieldName.split(PERIOD_REGEX);
    // Remove escape characters (`\`) after the field name is split.
    fieldNameKeys = fieldNameKeys.map((key) => key.replace(BACKSLASH_REGEX, ''));

    formatterName = validateSubfield(formatterName);
    if (null !== formatterName) {
        formatterName.replace(BACKSLASH_REGEX, '');
    }

    formatterOptions = validateSubfield(formatterOptions);
    if (null !== formatterOptions) {
        formatterOptions.replace(BACKSLASH_REGEX, '');
    }
    return {fieldNameKeys, formatterName, formatterOptions};
}


export {
    jsonValueToString,
    splitFieldPlaceholder,
    YSCOPE_FORMATTERS_MAP,
};


