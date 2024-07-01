/**
 * Type for values in a JSON object/array.
 * Reference: https://www.json.org/json-en.html
 */
type JsonValue = null |
    string |
    number |
    boolean |
    { [key: string]: JsonValue } |
    Array<JsonValue>;

/**
 * JSON object type.
 * Reference: https://www.json.org/json-en.html
 */
type JsonObject = { [key: string]: JsonValue };

/**
 * The maximum length that a string can have in the V8 JavaScript engine.
 * Reference: https://v8.github.io/api/head/classv8_1_1String.html#a66259940a4836974906729017ff25fd2
 */
// eslint-disable-next-line no-magic-numbers
const MAX_V8_STRING_LENGTH = (1 << 29) - 24;

export type {
    JsonObject,
    JsonValue,
};
export {MAX_V8_STRING_LENGTH};
