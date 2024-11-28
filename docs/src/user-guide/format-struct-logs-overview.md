# Overview

The log viewer can format structured (e.g. JSON) logs as plain text using a format string. The
format string allows you to select which fields to include and how they should be formatted. You can
configure the format string through the settings ({fas}`gear`) dialog.

For example, for a JSON log with many fields:

```json
{
  "ts": 1732733160216,
  "level": "ERROR",
  "message": "Failed to process payment",
  "trace_id": "abc123def456",
  "span_id": "span_789xyz",
  "service": "payment-service",
  "environment": "production"
}
```

You might want to show only:
* `timestamp`
* `level`
* `message`

You can achieve this with the following format string `{ts:timestamp} {level} {message}`.
`{ts:timestamp}` formats the timestamp field (Unix epoch) as an ISO 8601 date format while `{level}`
and `{message}` display the specified fields as is.

The formatted log would appear as:
```
2024-11-27T18:46:00Z ERROR Failed to process payment.
```

For reference docs, see:
* [Format string syntax](format-struct-logs-syntax)
* [Formatters](format-struct-logs-formatters)
