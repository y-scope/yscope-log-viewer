# Formatters

Formatters allow you to transform how field values are displayed. Below we describe all available
formatters and their options.

## Timestamp formatter

Converts millisecond Unix timestamps to human-readable date-time strings.

### Usage
```
{field:timestamp[:options]}
```

### Options
A [Day.js format string](https://day.js.org/docs/en/display/format) for the date and time.

**Default:** `YYYY-MM-DDTHH:mm:ssZ` (ISO 8601)

### Examples
Assuming the field `ts` is `1732703400000`:

* `{ts:timestamp}` → `2024-11-27T10:30:00Z`
* `{ts:timestamp:YYYY-MM-DD}` → `2024-11-27`

## Round formatter

Rounds a numeric value to the nearest integer.

### Usage
```
{field:round}
```

### Examples
Assuming the field `value` is `5.7`:

* `{value:round}` → `6`
