/**
 * Converts a *simple* java.time.format.DateTimeFormatter pattern to a Day.js date format string.
 *
 * NOTE: This method doesn't handle all possible patterns. Check the implementation to determine
 * what's supported.
 *
 * @param pattern
 * @return The corresponding Day.js date format string.
 */
const convertDateTimeFormatterPatternToDayJs = (pattern: string): string => {
    pattern = pattern.replace("yyyy", "YYYY");
    pattern = pattern.replace("yy", "YY");
    pattern = pattern.replace("dd", "D");
    pattern = pattern.replace("d", "D");

    return pattern;
};

export {convertDateTimeFormatterPatternToDayJs};
