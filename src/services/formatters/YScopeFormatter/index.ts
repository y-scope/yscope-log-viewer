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
    #formatString: string;

    #fieldPlaceholders: YScopeFieldPlaceholder[] = [];

    constructor (options: FormatterOptionsType) {
        this.#formatString = options.formatString;
        this.#parseFieldPlaceholder();
    }


    formatLogEvent (logEvent: LogEvent): string {
        const placeholderPattern = new RegExp(FIELD_PLACEHOLDER_REGEX, "g");
        const backslashPattern = new RegExp(BACKSLASH_REGEX, "g");
        let formattedLog = "";

        // Keeps track of the last position in format string.
        let lastIndex = 0;

        for (const fieldPlaceholder of this.#fieldPlaceholders) {
            const placeholderMatch = placeholderPattern.exec(this.#formatString);
            if (null === placeholderMatch) {
                throw Error("Insufficient placeholder quantity: format string was modified");
            }

            const notPlaceholder = this.#formatString.slice(lastIndex, placeholderMatch.index);
            const cleanedNotPlaceholder = notPlaceholder.replaceAll(backslashPattern, "");

            formattedLog += cleanedNotPlaceholder;

            formattedLog += getFormattedField(logEvent, fieldPlaceholder);
            lastIndex = placeholderMatch.index + placeholderMatch[0].length;
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
        const pattern = new RegExp(FIELD_PLACEHOLDER_REGEX, "g");
        const it = this.#formatString.matchAll(pattern);
        for (const execResult of it) {
            // The 1-index of exec result is the capture group in `FIELD_PLACEHOLDER_REGEX`.
            // (i.e. entire field-placeholder excluding braces).
            const [, placeholderString]: (string | undefined) [] = execResult;

            if ("undefined" === typeof placeholderString) {
                throw Error("Field placeholder regex is invalid and does not have a capture group");
            }

            const {fieldNameKeys, formatterName, formatterOptions} =
                splitFieldPlaceholder(placeholderString);

            if (null === formatterName) {
                this.#fieldPlaceholders.push({
                    fieldNameKeys: fieldNameKeys,
                    fieldFormatter: null,
                });
                continue;
            }

            const FieldFormatterConstructor = YSCOPE_FORMATTERS_MAP[formatterName];
            if ("undefined" === typeof FieldFormatterConstructor) {
                throw Error(`Formatter ${formatterName} is not currently supported`);
            }

            const fieldFormatter: YScopeFieldFormatter =
                new FieldFormatterConstructor(formatterOptions);

            this.#fieldPlaceholders.push({
                fieldNameKeys: fieldNameKeys,
                fieldFormatter: fieldFormatter,
            });
        }
    }
}

export default YScopeFormatter;
