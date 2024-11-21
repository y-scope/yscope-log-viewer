import {Nullable} from "../../../typings/common";
import {
    FIELD_PLACEHOLDER_REGEX,
    Formatter,
    FormatterOptionsType,
    REPLACEMENT_CHARACTER_REGEX,
    YScopeFieldFormatter,
    YScopeFieldPlaceholder,
} from "../../../typings/formatters";
import {LogEvent} from "../../../typings/logs";
import {
    getFormattedField,
    removeEscapeCharacters,
    replaceDoubleBacklash,
    splitFieldPlaceholder,
    YSCOPE_FORMATTERS_MAP,
} from "./utils";


/**
 * A formatter that uses a YScope format string to format log events into a string. See
 * `YScopeFormatterOptionsType` for details about the format string.
 */
class YScopeFormatter implements Formatter {
    readonly #processedFormatString: string;

    #fieldPlaceholders: YScopeFieldPlaceholder[] = [];

    constructor (options: FormatterOptionsType) {
        if (REPLACEMENT_CHARACTER_REGEX.test(options.formatString)) {
            console.log("Replacement character is an invalid character in format string." +
                 "Replacement character will appear as \\.");
        }

        this.#processedFormatString = replaceDoubleBacklash(options.formatString);
        this.#parseFieldPlaceholder();
    }

    formatLogEvent (logEvent: LogEvent): string {
        let formattedLog = "";

        // Keeps track of the last position in format string.
        let lastIndex = 0;

        for (const fieldPlaceholder of this.#fieldPlaceholders) {
            const formatStringFragment =
                this.#processedFormatString.slice(lastIndex, fieldPlaceholder.range.start);
            const cleanedFragment = removeEscapeCharacters(formatStringFragment);

            formattedLog += cleanedFragment;

            formattedLog += getFormattedField(logEvent, fieldPlaceholder);
            lastIndex = fieldPlaceholder.range.end;
        }

        const remainder = this.#processedFormatString.slice(lastIndex);
        formattedLog += removeEscapeCharacters(remainder);

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
        const it = this.#processedFormatString.matchAll(placeholderPattern);
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
