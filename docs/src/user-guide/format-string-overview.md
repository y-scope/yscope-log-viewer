# Overview

The log viewer can accept a format string to transform JSON logs into human-readable text.
You can select which fields to display and how they should be formatted. The format string
input can be found in the settings dialog.

For example, for a JSON log with many fields:

```json
{
    "ts": 1732733160216,
    "level": "ERROR",
    "message": "Failed to process payment transaction",
    "trace_id": "abc123def456",
    "span_id": "span_789xyz",
    "service": "payment-service",
    "environment": "production",
}
```

You might want to show only:
- timestamp
- log level
- message

You can achieve this with the following format string `{ts:timestamp} {level} {message}`.
`{ts:timestamp}` formats the timestamp field (Unix epoch) into a ISO 8601 date format.
`{level}` and `{message}` display the field as is.

The log is displayed as:
```
2024-11-27T18:46:00Z ERROR Failed to process payment transaction.
```

For detailed information about the format string syntax, see [Format String Syntax](format-string-syntax).
