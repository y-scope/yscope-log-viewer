import {JsonObject, JsonValue} from "../typings/js";

/**
 * Gets a nested value from a JSON object.
 * @param fields The JSON object.
 * @param keys An array of keys representing the path to the nested value. E.g., the field
 * `{"a:" {"b": 0}}` would be accessed using array `["a", "b"]`
 * @returns The nested value if found, otherwise `undefined`.
*/
const getNestedJsonValue = (fields: JsonObject, keys: string[]): JsonValue | undefined => {
    let result: JsonValue | undefined = fields;
    for (const key of keys) {
        if ("object" !== typeof result  || result === null || Array.isArray(result)) {
            return undefined;
        }
        result = result[key];
    }
    return result;
}

export {
    getNestedJsonValue
};
