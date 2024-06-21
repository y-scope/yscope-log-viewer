/**
 * Type of values in JSON structures.
 * Reference: https://www.json.org/json-en.html
 */
type JsonValue = null |
    string |
    number |
    boolean |
    { [key: string]: JsonValue } |
    Array<JsonValue>;

/**
 * Type of JSON object structure, which is a collection of name/value pairs.
 * Reference: https://www.json.org/json-en.html
 */
type JsonObject = { [key: string]: JsonValue };

export type {
    JsonObject,
    JsonValue,
};
