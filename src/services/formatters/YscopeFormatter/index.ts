import {Nullable} from "../../../typings/common";
import {
    FIELD_PLACEHOLDER_REGEX,
    Formatter,
    FormatterOptionsType,
    REPLACEMENT_CHARACTER,
    YscopeFieldFormatter,
    YscopeFieldPlaceholder,
} from "../../../typings/formatters";
import {LogEvent} from "../../../typings/logs";
import {
    getFormattedField,
    jsonValueToString,
    removeEscapeCharacters,
    replaceDoubleBacklash,
    splitFieldPlaceholder,
    YSCOPE_FIELD_FORMATTER_MAP,
} from "./utils";


/**
 * A formatter that uses a YScope format string to format log events into a string. See
 * `YscopeFormatterOptionsType` for details about the format string.
 */
class YscopeFormatter implements Formatter {
    readonly #processedFormatString: string;

    #fieldPlaceholders: YscopeFieldPlaceholder[] = [];

    constructor (options: FormatterOptionsType) {
        if (options.formatString.includes(REPLACEMENT_CHARACTER)) {
            console.warn("Unicode replacement character `U+FFFD` is found in Decoder Format" +
            ' String, which will appear as "\\".');
        }

        this.#processedFormatString = replaceDoubleBacklash(options.formatString);
        this.#parseFieldPlaceholder();
    }

    formatLogEvent (logEvent: LogEvent): string {
        // Empty format string is special case where formatter returns all fields as JSON.
        if ("" === this.#processedFormatString) {
            return `${jsonValueToString(logEvent.fields)}\n`;
        }

        const formattedLogFragments: string[] = [];
        let lastIndex = 0;

        for (const fieldPlaceholder of this.#fieldPlaceholders) {
            const formatStringFragment =
                this.#processedFormatString.slice(lastIndex, fieldPlaceholder.range.start);

            formattedLogFragments.push(removeEscapeCharacters(formatStringFragment));
            formattedLogFragments.push(getFormattedField(logEvent, fieldPlaceholder));
            lastIndex = fieldPlaceholder.range.end;
        }

        const remainder = this.#processedFormatString.slice(lastIndex);
        formattedLogFragments.push(removeEscapeCharacters(remainder));

        return `${formattedLogFragments.join("")}\n`;
    }

    /**
     * Parses field placeholders in format string. For each field placeholder, creates a
     * corresponding `YscopeFieldFormatter` using the placeholder's field name, formatter type,
     * and formatter options. Each `YscopeFieldFormatter` is then stored on the
     * class-level array `#fieldPlaceholders`.
     *
     * @throws Error if `FIELD_PLACEHOLDER_REGEX` does not contain a capture group.
     * @throws Error if a formatter type is not supported.
     */
    #parseFieldPlaceholder () {
        const placeholderPattern = new RegExp(FIELD_PLACEHOLDER_REGEX, "g");
        const it = this.#processedFormatString.matchAll(placeholderPattern);
        for (const match of it) {
            // `fullMatch` includes braces and `groupMatch` excludes them.
            const [fullMatch, groupMatch]: (string | undefined) [] = match;

            if ("undefined" === typeof groupMatch) {
                throw Error("Field placeholder regex is invalid and does not have a capture group");
            }

            const {fieldNameKeys, formatterName, formatterOptions} =
                splitFieldPlaceholder(groupMatch);

            let fieldFormatter: Nullable<YscopeFieldFormatter> = null;
            if (null !== formatterName) {
                const FieldFormatterConstructor = YSCOPE_FIELD_FORMATTER_MAP[formatterName];
                if ("undefined" === typeof FieldFormatterConstructor) {
                    throw Error(`Formatter ${formatterName} is not currently supported`);
                }
                fieldFormatter = new FieldFormatterConstructor(formatterOptions);
            }

            this.#fieldPlaceholders.push({
                fieldNameKeys: fieldNameKeys,
                fieldFormatter: fieldFormatter,
                range: {
                    start: match.index,
                    end: match.index + fullMatch.length,
                },
            });
        }
    }
}

export default YscopeFormatter;
