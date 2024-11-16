import {
    FIELD_PLACEHOLDER_REGEX,
    Formatter,
    FormatterOptionsType,
    YScopeFieldFormatter,
    YScopeFieldPlaceholder,
} from "../../../typings/formatters";
import {LogEvent} from "../../../typings/logs";
import {getNestedJsonValue} from "../../../utils/js";
import {
    jsonValueToString,
    splitFieldPlaceholder,
    YSCOPE_FORMATTERS_MAP,
} from "./utils";


/**
 * A formatter that uses a Yscope format string to format log events into a string. See
 * `YscopeFormatterOptionsType` for details about the format string.
 */
class YscopeFormatter implements Formatter {
    #formatString: string;

    #fieldPlaceholders: YScopeFieldPlaceholder[] = [];

    constructor (options: FormatterOptionsType) {
        // NOTE: It's safe for these values to be empty strings.
        this.#formatString = options.formatString;
        this.#parseFieldPlaceholder();
    }

    formatLogEvent (logEvent: LogEvent): string {
        let placeholderIndex = 0;

        // Inline replacer function. Uses `placeholderIndex` indirectly via closure. Returns
        // a formatted field. Function gets the `YScopeFieldPlaceholder` specified by
        // `placeholderIndex` from array of placeholders parsed and validated in the class
        // constructor. Next, retrieves a field from the log event using the placeholder's
        // `fieldNameKeys`. The field is then formatted using the placeholder's `fieldFormatter`.
        const replacePlaceholder = () => {
            const fieldPlaceholder: YScopeFieldPlaceholder | undefined =
                this.#fieldPlaceholders[placeholderIndex];

            if ("undefined" === typeof fieldPlaceholder) {
                throw new Error("Unexpected change in placeholder quantity in format string.");
            }

            // Increment `placeholderIndex` taking advantage of closure property. Subsequent
            // calls to `replacePlaceholder()` will use the next index from array of placeholders.
            placeholderIndex++;

            const nestedValue = getNestedJsonValue(logEvent.fields, fieldPlaceholder.fieldNameKeys);
            if ("undefined" === typeof nestedValue) {
                return "undefined";
            }

            return fieldPlaceholder.fieldFormatter ?
                fieldPlaceholder.fieldFormatter.formatField(nestedValue) :
                jsonValueToString(nestedValue);
        };

        // Calls `replacePlaceholder()` for each pattern match in the format string. Effectively
        // replaces each field placeholder in the format string with values from the current
        // log event.
        const formattedLog =
            this.#formatString.replace(FIELD_PLACEHOLDER_REGEX, replacePlaceholder);

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
        const it = this.#formatString.matchAll(FIELD_PLACEHOLDER_REGEX);
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

export default YscopeFormatter;
