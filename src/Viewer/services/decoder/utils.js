function javaIntegerDivide (top, bottom) {
    const integerQuotient = Math.trunc(top / bottom);
    // In Java -5 / 10 = 0 whereas in JavaScript, Math.trunc(-5 / 10) = -0, so
    // so we need to switch -0 to 0 here.
    return -0 === integerQuotient ? 0 : integerQuotient;
}

function uint8ArrayContains (haystackArray, haystackArrayBeginOffset, needleArray,
                             needleArrayBeginOffset)
{
    const needleLength = needleArray.length - needleArrayBeginOffset;
    const haystackLength = haystackArray.length - haystackArrayBeginOffset;
    if (needleLength > haystackLength) {
        return false;
    }

    for (let i = 0; i < needleLength; ++i) {
        if (haystackArray[haystackArrayBeginOffset + i] !==
            needleArray[needleArrayBeginOffset + i])
        {
            return false;
        }
    }

    return true;
}

/**
 * Counts the occurrences of the given byte in the given UTF-8 string stored in
 * a Uint8Array.
 * <p></p>
 * NOTE: This is optimized for UTF-8 strings mostly containing ASCII characters.
 * @param {Uint8Array} haystack
 * @param {Number} needle
 * @return {number} numOccurrences
 */
function countByteOccurrencesInUtf8Uint8Array (haystack, needle) {
    let numOccurrences = 0;
    for (let i = 0; i < haystack.length; ++i) {
        const haystackByte = haystack[i];

        if (!(haystackByte & 0x80) && needle === haystackByte) {
            // Single-byte UTF-8 code-point matching the needle
            ++numOccurrences;
        }
    }
    return numOccurrences;
}

/**
 * Formats the given size value using either SI (kB, MB, etc.) or IEC (KiB, MiB,
 * etc.) units. E.g., 1024 -> "1 KiB"
 * @param {number} value The value in bytes
 * @param {boolean} [useSiUnits=true]
 * @param {number} [numFractionalDigits=1] Number of digits
 * to keep after the decimal point, after formatting.
 * @return {string} The value formatted as "<value> <unit>"
 */
function formatSizeInBytes (value, useSiUnits = true, numFractionalDigits = 1) {
    const SI_UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
    const IEC_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB", "RiB", "QiB"];

    let units;
    let divisor;
    if (useSiUnits) {
        units = SI_UNITS;
        divisor = 1000;
    } else {
        units = IEC_UNITS;
        divisor = 1024;
    }

    let unitIdx;
    // When checking whether the value is still greater than the divisor, we
    // need to use the value after rounding or else we might divide too little.
    // E.g.: Assume the caller passes
    // (value = 999999, useSiUnits = true, numDigitsAfterDecimalPoint = 1).
    // Without rounding before comparing with the divisor, this function would
    // return "1000.0 kB", but it should return "1.0 MB".
    const multiplier = 10 ** numFractionalDigits;
    for (unitIdx = 0; Math.round(Math.abs(value) * multiplier) / multiplier >= divisor
        && unitIdx < units.length; ++unitIdx)
    {
        value /= divisor;
    }

    return `${value.toFixed(numFractionalDigits)} ${units[unitIdx]}`;
}

/**
 * Tests if the provided value is boolean
 *
 * @param {string|number|boolean} value
 * @return {boolean}
 */
function isBoolean (value) {
    return (typeof value === "boolean");
}

/**
 * Tests if the provided value is numeric
 *
 * @param {string|number|boolean} value
 * @return {boolean}
 */
function isNumeric (value) {
    return (typeof value === "number");
}

export {countByteOccurrencesInUtf8Uint8Array, formatSizeInBytes,
    isBoolean, isNumeric, javaIntegerDivide, uint8ArrayContains};
