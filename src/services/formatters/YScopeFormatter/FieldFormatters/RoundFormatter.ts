import { YScopeFieldFormatter } from "../../../../typings/formatters";
import { Nullable } from "../../../../typings/common";
import { JsonValue } from "../../../../typings/js";
import {
    jsonValueToString,
} from "../utils"


/**
 * A field formatter that rounds numerical values to the nearest integer.
 * If the field value is not a number, it is returned as-is after being
 * converted to a string.
 */
class RoundFormatter implements YScopeFieldFormatter {
    constructor (options: Nullable<string>) {
        if (null !== options) {
            throw Error("Round formatter does not support option ${options}")
        }
    }

    formatField (field: JsonValue): string {
        if ("number" === typeof field) {
            field = Math.round(field);
        }

        return jsonValueToString(field)
    }
}

export default RoundFormatter;
