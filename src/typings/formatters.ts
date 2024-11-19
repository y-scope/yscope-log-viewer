import {Nullable} from "../typings/common";
import {JsonValue} from "./js";
import {LogEvent} from "./logs";


/**
 * @property formatString A Yscope format string. The format string can include field-placeholders
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

interface YScopeFieldFormatter {

    /**
     * Formats the given field.
     *
     * @param logEvent
     * @return The formatted field.
     */
    formatField: (field: JsonValue) => string
}

/**
 * Parsed field placeholder from a Yscope format string.
 */
type YScopeFieldPlaceholder = {
    fieldNameKeys: string[],
    fieldFormatter: Nullable<YScopeFieldFormatter>,

    // Location of field placeholder in format string including braces.
    range: {start: number, end: number}
}

/**
 * Type for list of currently supported Yscope field formatters.
 */
type YScopeFieldFormatterMap = {
    [key: string]: new (options: Nullable<string>) => YScopeFieldFormatter;
};

// Patterns to assist parsing YScope format string. All patterns accept unescaped
// matches only.
/**
 * Pattern to remove backlash.
 */
const BACKSLASH_REGEX = Object.freeze(/(?<!\\)\\/);

/**
 * Pattern to split field placeholder.
 */
const COLON_REGEX = Object.freeze(/(?<!\\):/);

/**
 * Pattern to match field placeholder.
 */
const FIELD_PLACEHOLDER_REGEX = Object.freeze(/(?<!\\)\{(.*?)(?<!\\)\}/);

/**
 * Pattern to split field name.
 */
const PERIOD_REGEX = Object.freeze(/(?<!\\)\./);

export type {
    Formatter,
    FormatterOptionsType,
    YScopeFieldFormatter,
    YScopeFieldFormatterMap,
    YScopeFieldPlaceholder,
};

export {
    BACKSLASH_REGEX,
    COLON_REGEX,
    FIELD_PLACEHOLDER_REGEX,
    PERIOD_REGEX,
};
