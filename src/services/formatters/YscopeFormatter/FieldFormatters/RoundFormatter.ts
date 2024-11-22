import {Nullable} from "../../../../typings/common";
import {YscopeFieldFormatter} from "../../../../typings/formatters";
import {JsonValue} from "../../../../typings/js";
import {jsonValueToString} from "../utils";


/**
 * A field formatter that rounds numerical values to the nearest integer.
 * For non-numerical values, the field's value is converted to a string then returned as-is.
 * Options: None.
 */
class RoundFormatter implements YscopeFieldFormatter {
    constructor (options: Nullable<string>) {
        if (null !== options) {
            throw Error(`RoundFormatter does not support options "${options}"`);
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
