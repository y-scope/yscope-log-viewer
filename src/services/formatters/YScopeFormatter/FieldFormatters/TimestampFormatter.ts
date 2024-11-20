import {Dayjs} from "dayjs";

import {Nullable} from "../../../../typings/common";
import {YScopeFieldFormatter} from "../../../../typings/formatters";
import {JsonValue} from "../../../../typings/js";
import {convertToDayjsTimestamp} from "../../../decoders/JsonlDecoder/utils";


/**
 * A formatter that formats timestamp values using a specified date-time pattern.
 * If no pattern is provided as an option, the timestamp is formatted in the
 * default ISO 8601 format.
 */
class TimestampFormatter implements YScopeFieldFormatter {
    #dateFormat: Nullable<string> = null;

    constructor (options: Nullable<string>) {
        this.#dateFormat = options;
    }

    formatField (field: JsonValue): string {
        // eslint-disable-next-line no-warning-comments
        // TODO: We already parsed the timestamp during deserialization so this is perhaps
        // inefficient. However, this field formatter can be used for multiple keys, so using
        // the single parsed timestamp by itself would not work. Perhaps in future we can check
        // if the key is the same as timestamp key and avoid parsing again.
        const timestamp: Dayjs = convertToDayjsTimestamp(field);
        if (null === this.#dateFormat) {
            return timestamp.format();
        }

        return timestamp.format(this.#dateFormat);
    }
}

export default TimestampFormatter;
