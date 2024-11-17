import {Nullable} from "../typings/common";
import {JsonValue} from "./js";
import {LogEvent} from "./logs";


/**
 * Options for the LogbackFormatter.
 *
 * @property formatString A Logback-like format string. The format string may include specifiers
 * indicating how and what kv-pair may be inserted to replace the specifier in the string. A
 * specifier uses the following syntax: `%<name>{<format-options>}`
 * - <name> is the specifier's name.
 * - <format-options> (along with the braces) are optional and indicate how to format the kv-pair
 * when inserting it. Options cannot include literal '%' or '}' characters.
 * - Literal '%' characters cannot be escaped.
 *
 * The following specifiers are currently supported:
 * - `d` - Indicates the log event's authoritative timestamp. Its options may include a
 * java.time.format.DateTimeFormatter pattern indicating how to format the timestamp. NOTE: Not
 * all patterns are supported; see `convertDateTimeFormatterPatternToDayJs` to determine what's
 * supported.
 * - `n` - Indicates a newline character. This is currently ignored by the formatter since it always
 * inserts a newline as the last character.
 * - `<key>` - Any specifier besides those above indicate a key for a kv-pair, if said kv-pair
 * exists in a given log event.
 */
interface LogbackFormatterOptionsType {
    formatString: string,
}

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

type FormatterOptionsType = LogbackFormatterOptionsType | YscopeFormatterOptionsType;

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
    LogbackFormatterOptionsType,
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
