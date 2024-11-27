# Formatters

Formatters allow you to transform how field values are displayed. See below for a list of
formatters.

## Timestamp Formatter

Converts Unix timestamps to human-readable date-time strings.

**Usage:**
`{field:timestamp[:options]}`

**Options:**
- Accepts a format string specifically for the date.
- Uses [Day.js format tokens](https://day.js.org/docs/en/display/format).
- Date string must escape colons with a backslash, e.g., `HH\:mm\:ss`.
- If no format is specified, the default format is ISO 8601.

**Examples:**
- `{ts:timestamp}` → `2024-11-27T10:30:00Z`
- `{ts:timestamp:YYYY-MM-DD}` → `2024-11-27`

---

## Round Formatter

Rounds a numeric value to the nearest integer.

**Usage:**
`{field:round}`

**Example:**
- `{value:round}` → `5.7` becomes `6`
