/**
 * Represents a time zone, which can either be a numeric offset from UTC or a string identifier.
 *
 * - A numeric value indicates the offset from UTC in hours (e.g., `-5` represents UTC-5, which is 5
 * hours behind UTC).
 * - A string value represents a time zone identifier as either a time zone offset notation (e.g.,
 * `'UTC+02:00'`, `'UTC-05:00'`) or a time zone name listed by the
 * `Intl.supportedValuesOf("timeZone")` method (e.g., `'America/Toronto'`, `'Asia/Hong_Kong'`).
 */
type Timezone = number | string;

const UTC_TIMEZONE_NAME = "UTC";

const DEFAULT_TIMEZONE_NAME = UTC_TIMEZONE_NAME;
const {timeZone: BROWSER_TIMEZONE_NAME} = new Intl.DateTimeFormat().resolvedOptions();

const LOGGER_TIMEZONE_NAME = "Original";

const UTC_TIMEZONE_OFFSET_NAMES: string[] = [
    "UTC-12:00",
    "UTC-11:00",
    "UTC-10:00",
    "UTC-09:30",
    "UTC-09:00",
    "UTC-08:00",
    "UTC-07:00",
    "UTC-06:00",
    "UTC-05:00",
    "UTC-04:00",
    "UTC-03:30",
    "UTC-03:00",
    "UTC-02:30",
    "UTC-02:00",
    "UTC-01:00",
    "UTC+01:00",
    "UTC+02:00",
    "UTC+03:00",
    "UTC+03:30",
    "UTC+04:00",
    "UTC+04:30",
    "UTC+05:00",
    "UTC+05:30",
    "UTC+05:45",
    "UTC+06:00",
    "UTC+06:30",
    "UTC+07:00",
    "UTC+08:00",
    "UTC+09:00",
    "UTC+09:30",
    "UTC+10:00",
    "UTC+10:30",
    "UTC+11:00",
    "UTC+12:00",
    "UTC+12:45",
    "UTC+13:00",
    "UTC+13:45",
    "UTC+14:00",
];

const INTL_SUPPORTED_TIMEZONE_NAMES: string[] = Intl.supportedValuesOf("timeZone");


/**
 * Checks if the provided timezone name is a valid UTC offset.
 *
 * @param timezoneName
 * @return Returns true if the timezone name is in the format 'UTC±HH:MM', false otherwise.
 */
const isTimezoneUtcOffsetName = (timezoneName: string)
: boolean => UTC_TIMEZONE_OFFSET_NAMES.includes(timezoneName);

enum TIMEZONE_CATEGORY {
    DEFAULT = "default",
    BROWSER = "browser",
    LOGGER = "logger",
    MANUAL = "manual",
}

/**
 * Classify the timezone name into TIMEZONE_CATEGORY.
 *
 * @param timezoneName
 * @return
 */
const getTimezoneCategory = (timezoneName: string): TIMEZONE_CATEGORY => {
    switch (timezoneName) {
        case DEFAULT_TIMEZONE_NAME:
            return TIMEZONE_CATEGORY.DEFAULT;
        case BROWSER_TIMEZONE_NAME:
            return TIMEZONE_CATEGORY.BROWSER;
        case LOGGER_TIMEZONE_NAME:
            return TIMEZONE_CATEGORY.LOGGER;
        default:
            return TIMEZONE_CATEGORY.MANUAL;
    }
};

export type {Timezone};
export {
    BROWSER_TIMEZONE_NAME,
    DEFAULT_TIMEZONE_NAME,
    getTimezoneCategory,
    INTL_SUPPORTED_TIMEZONE_NAMES,
    isTimezoneUtcOffsetName,
    LOGGER_TIMEZONE_NAME,
    TIMEZONE_CATEGORY,
    UTC_TIMEZONE_OFFSET_NAMES,
};
