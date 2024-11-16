import {Dayjs} from "dayjs";
import { YScopeFieldFormatter } from "../../../../typings/formatters";
import { Nullable } from "../../../../typings/common";
import {convertDateTimeFormatterPatternToDayJs} from "../../../../utils/formatters";
import { JsonValue } from "../../../../typings/js";

import { convertToDayjsTimestamp } from "../../../decoders/JsonlDecoder/utils"

/**
 * A formatter that formats timestamp values using a specified date-time pattern.
 * If no pattern is provided, the timestamp is formatted in the default ISO 8601 format.
 */
class TimestampFormatter implements YScopeFieldFormatter {
    #dateFormat: Nullable<string> = null;

    constructor (options: Nullable<string>) {
        if (options !== null) {
            this.#dateFormat = convertDateTimeFormatterPatternToDayJs(options);
        }
    }

    formatField (field: JsonValue): string {
        // TODO: We already parsed the timestamp during deserialization so this is perhaps
        // inefficient. However, this field formatter can be used for multiple keys, so using
        // the single parsed timestamp by itself would not work. Perhaps in future we can check
        // if the key is the same as timestamp key and parse again.
        const timestamp: Dayjs = convertToDayjsTimestamp(field);
        if (this.#dateFormat === null) {
            return timestamp.format();
        }

        return timestamp.format(this.#dateFormat);
    }
}

export default TimestampFormatter;
