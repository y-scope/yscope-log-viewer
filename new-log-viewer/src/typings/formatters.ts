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

type FormatterOptionsType = LogbackFormatterOptionsType;

interface Formatter {
    formatLogEvent: (logEvent: LogEvent) => string
}

export type {
    Formatter,
    FormatterOptionsType,
    LogbackFormatterOptionsType,
};
