import {Nullable} from "../typings/common";
import {JsonValue} from "./js";
import {LogEvent} from "./logs";


/**
 * @property formatString A YScope format string. The format string can include field-placeholders
 * to insert and format any field of a JSON log event. A field-placeholder uses the following
 * syntax:
 * `{<field-name>[:<formatter-name>[:<formatter-options>]]}`
 * - <field-name> (required) defines the key of the field whose value should replace the
 * placeholder.
 * - Nested fields can be specified using periods (`.`) to denote hierarchy. E.g., the field
 * `{"a:" {"b": 0}}` may be denoted by `a.b`.
 * - To denote a field-name with periods escape the periods with a backslashes.
 * - <formatter-name> (optional) is the name of the formatter to apply to the value before
 * inserting it into the string.
 * - <formatter-options> (optional) defines any options for the formatter denoted by formatter-name.
 *
 * All three as may contain any character, except that colons (:), right braces (}),
 * and backslashes (\) must be escaped with a backslash.
 */
interface YscopeFormatterOptionsType {
    formatString: string,
}

type FormatterOptionsType = YscopeFormatterOptionsType;

interface Formatter {

    /**
     * Formats the given log event.
     *
     * @param logEvent
     * @return The formatted log event.
     */
    formatLogEvent: (logEvent: LogEvent) => string
}

interface YscopeFieldFormatter {

    /**
     * Formats the given field.
     *
     * @param logEvent
     * @return The formatted field.
     */
    formatField: (field: JsonValue) => string
}

/**
 * Type for list of currently supported YScope field formatters.
 */
type YscopeFieldFormatterMap = {
    [key: string]: new (options: Nullable<string>) => YscopeFieldFormatter;
};

/**
 * Parsed field placeholder from a YScope format string.
 */
type YscopeFieldPlaceholder = {
    fieldNameKeys: string[],
    fieldFormatter: Nullable<YscopeFieldFormatter>,

    // Location of field placeholder in format string including braces.
    range: {start: number, end: number}
}

/**
 * Unicode replacement character `U+FFFD` to substitute escaped backslash (`\\`) in format string.
 */
const REPLACEMENT_CHARACTER = "�";

/**
 * Used to remove single backlash in format string.
 */
const SINGLE_BACKSLASH = "\\";

/**
 * Used to replace double backlash in format string.
 */
const DOUBLE_BACKSLASH = "\\\\";

// Patterns to assist parsing YScope format string.

/**
 * Pattern to split field unescaped placeholder.
 */
const COLON_REGEX = Object.freeze(/(?<!\\):/);

/**
 * Pattern to match unescaped field placeholder.
 */
const FIELD_PLACEHOLDER_REGEX = Object.freeze(/(?<!\\)\{(.*?)(?<!\\)\}/);

/**
 * Pattern to split unescaped field name.
 */
const PERIOD_REGEX = Object.freeze(/(?<!\\)\./);

export type {
    Formatter,
    FormatterOptionsType,
    YscopeFieldFormatter,
    YscopeFieldFormatterMap,
    YscopeFieldPlaceholder,
};

export {
    COLON_REGEX,
    DOUBLE_BACKSLASH,
    FIELD_PLACEHOLDER_REGEX,
    PERIOD_REGEX,
    REPLACEMENT_CHARACTER,
    SINGLE_BACKSLASH,
};
