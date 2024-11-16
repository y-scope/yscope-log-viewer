import {Nullable} from "../../../../typings/common";
import {YScopeFieldFormatter} from "../../../../typings/formatters";
import {JsonValue} from "../../../../typings/js";
import {jsonValueToString} from "../utils";


/**
 * A field formatter that rounds numerical values to the nearest integer.
 * If the field value is not a number, it is returned as-is after being
 * converted to a string. Does not currently support any options.
 */
class RoundFormatter implements YScopeFieldFormatter {
    constructor (options: Nullable<string>) {
        if (null !== options) {
            throw Error(`Round formatter does not support option ${options}`);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    formatField (field: JsonValue): string {
        if ("number" === typeof field) {
            field = Math.round(field);
        }

        return jsonValueToString(field);
    }
}

export default RoundFormatter;
