import {Nullable} from "../../../typings/common";
import {
    BACKSLASH_REGEX,
    FIELD_PLACEHOLDER_REGEX,
    Formatter,
    FormatterOptionsType,
    YScopeFieldFormatter,
    YScopeFieldPlaceholder,
} from "../../../typings/formatters";
import {LogEvent} from "../../../typings/logs";
import {
    getFormattedField,
    splitFieldPlaceholder,
    YSCOPE_FORMATTERS_MAP,
} from "./utils";


/**
 * A formatter that uses a YScope format string to format log events into a string. See
 * `YScopeFormatterOptionsType` for details about the format string.
 */
class YScopeFormatter implements Formatter {
    readonly #formatString: string;

    #fieldPlaceholders: YScopeFieldPlaceholder[] = [];

    constructor (options: FormatterOptionsType) {
        this.#formatString = options.formatString;
        this.#parseFieldPlaceholder();
    }


    formatLogEvent (logEvent: LogEvent): string {
        const backslashPattern = new RegExp(BACKSLASH_REGEX, "g");
        let formattedLog = "";

        // Keeps track of the last position in format string.
        let lastIndex = 0;

        for (const fieldPlaceholder of this.#fieldPlaceholders) {
            const notPlaceholder =
                this.#formatString.slice(lastIndex, fieldPlaceholder.range.start);
            const cleanedNotPlaceholder = notPlaceholder.replaceAll(backslashPattern, "");

            formattedLog += cleanedNotPlaceholder;

            formattedLog += getFormattedField(logEvent, fieldPlaceholder);
            lastIndex = fieldPlaceholder.range.end;
        }

        const remainder = this.#formatString.slice(lastIndex);
        const cleanedRemainder = remainder.replace(backslashPattern, "");
        formattedLog += cleanedRemainder;

        return `${formattedLog}\n`;
    }

    /**
     * Parses field name, formatter name, and formatter options from placeholders in the format
     * string. For each placeholder, it creates a corresponding `YScopeFieldFormatter` and adds
     * it to the class-level array.
     *
     * @throws Error if `FIELD_PLACEHOLDER_REGEX` does not contain a capture group.
     * @throws Error if a specified formatter is not supported.
     */
    #parseFieldPlaceholder () {
        const placeholderPattern = new RegExp(FIELD_PLACEHOLDER_REGEX, "g");
        const it = this.#formatString.matchAll(placeholderPattern);
        for (const match of it) {
            // `fullMatch` includes braces and `groupMatch` excludes them.
            const [fullMatch, groupMatch]: (string | undefined) [] = match;

            if ("undefined" === typeof groupMatch) {
                throw Error("Field placeholder regex is invalid and does not have a capture group");
            }

            const {fieldNameKeys, formatterName, formatterOptions} =
                splitFieldPlaceholder(groupMatch);

            let fieldFormatter: Nullable<YScopeFieldFormatter> = null;
            if (null !== formatterName) {
                const FieldFormatterConstructor = YSCOPE_FORMATTERS_MAP[formatterName];
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

export default YScopeFormatter;
