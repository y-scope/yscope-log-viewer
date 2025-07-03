const MINUTES_IN_HOUR = 60;

/**
 * Gets the UTC offset in minutes for a given timezone name.
 *
 * @param timezoneName
 * @return The UTC offset in minutes. For example, "UTC+02:00" returns 120.
 */
const getUtcOffsetFrom = (timezoneName: string): number => {
    const [hours, minutes] = timezoneName
        .replace("UTC", "")
        .split(":")
        .map((part) => parseInt(part, 10));

    return (
        (hours || 0) * MINUTES_IN_HOUR
    ) + (minutes || 0);
};


export {getUtcOffsetFrom};
