import {
    JsonObject,
    JsonValue,
} from "../typings/js";


type KeyValuePair = [string, unknown];

/**
 * Flattens nested objects into a flat array of key-value pairs, using dot-notation to represent
 * nested keys.
 *
 * @param obj
 * @param prefix Key prefix for nested properties.
 * @return The flattened key-value pairs as an array.
 */
const flattenObject = (obj: Record<string, unknown>, prefix = ""): KeyValuePair[] => {
    const result: KeyValuePair[] = [];

    for (const key in obj) {
        if (false === Object.hasOwn(obj, key)) {
            continue;
        }

        const fullKey = prefix ?
            `${prefix}.${key}` :
            key;
        const value = obj[key];

        if ("object" === typeof value && null !== value && false === Array.isArray(value)) {
            result.push(...flattenObject(value as Record<string, unknown>, fullKey));
        } else if (Array.isArray(value)) {
            result.push([
                fullKey,
                JSON.stringify(value),
            ]);
        } else {
            result.push([
                fullKey,
                value,
            ]);
        }
    }

    return result;
};

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

/**
 * Converts a JSON value to its string representation.
 *
 * @param input
 * @return
 */
const jsonValueToString = (input: JsonValue | undefined): string => {
    // Behaviour is different for `undefined`.
    return "object" === typeof input ?
        JSON.stringify(input) :
        String(input);
};


export {
    flattenObject,
    getNestedJsonValue,
    jsonValueToString,
};
