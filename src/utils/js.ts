import {
    JsonObject,
    JsonValue,
} from "../typings/js";


/**
 * Gets a nested value from a JSON object.
 *
 * @param fields The JSON object.
 * @param keys An array of keys representing the path to the nested value. E.g., the field
 * `{"a:" {"b": 0}}` would be accessed using array `["a", "b"]`
 * @return The nested value if found, otherwise `undefined`.
 */
const getNestedJsonValue = (fields: JsonObject, keys: string[]): JsonValue | undefined => {
    let result: JsonValue | undefined = fields;
    for (const key of keys) {
        if ("object" !== typeof result || null === result || Array.isArray(result)) {
            // `undefined` seems natural as return value for this function since matches
            // js behaviour.
            // eslint-disable-next-line no-undefined
            return undefined;
        }
        result = result[key];
    }

    return result;
};

export {getNestedJsonValue};
