
import {
    Formatter,
    FormatterOptionsType,
} from "../../typings/formatters";
import {Nullable} from "../../typings/common";
import {JsonObject} from "../../typings/js";
import {LogEvent} from "../../typings/logs";

//cannot use split since timestamp can have colon...
function extractBetween(regex: RegExp, str: string): Nullable<string> {
    const startIndex: number = regex.lastIndex;
    const match = regex.exec(str);

    if (null === match) {
        return null
    }

    const colonIndex = match.index;
    return str.slice(startIndex, colonIndex);
}


class YscopeFormatter implements Formatter {
    #formatString: string;

    constructor (options: FormatterOptionsType) {
        // NOTE: It's safe for these values to be empty strings.
        this.#formatString = options.formatString;

        // Remove new line
        this.#formatString = this.#formatString.replace("%n", "");
        this.#parseFieldPlaceholder()
    }

    formatLogEvent (logEvent: LogEvent): string {
        return "test"
    }

    #parseFieldPlaceholder () {
        const FIELD_PLACEHOLDER_REGEX = /(?<!\\)\{([^}]+)\}/g;
        const COLON_REGEX = /(?<!\\):/g;
        const PERIOD_REGEX = /(?<!\\)./g;
        // Find backlash except followed by another backlash
        const UNESCAPE_REGEX = /\\(?!\\)/g;

        for (const match of this.#formatString.matchAll(FIELD_PLACEHOLDER_REGEX)) {

            const [,fieldPlaceholder] = match;

            let fieldName = null;
            let formatterName = null;
            let formatterOptions  = null;

            fieldName = extractBetween(COLON_REGEX, fieldPlaceholder as string)
            if (fieldName == null) {
                throw Error("no field name")
            }

            if (fieldName != null) {
                formatterName = extractBetween(COLON_REGEX, fieldPlaceholder as string)
                if (formatterName != null) {
                    formatterOptions = extractBetween(COLON_REGEX, fieldPlaceholder as string) ;
                }
            }

            const keys = fieldName.split(PERIOD_REGEX)
            for (let key of keys) {
                key.replace(UNESCAPE_REGEX, '');
            }
        }
    }
}


export default YscopeFormatter;
