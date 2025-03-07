# Format string syntax

Each format string is composed of:
* [Static text](#static-text)
* [Field placeholders](#field-placeholders)
* [An implicit trailing newline](#implicit-trailing-newline)

## Static text
Static text may contain any character, except the following characters must be escaped with a
backslash:
* `{`
* `}`
* `\`

## Field placeholders
Each field placeholder is enclosed in braces (`{` and `}`) and has the following form, consisting of
three components:
```
{<field-name>[:<formatter-name>[:<formatter-options>]]}
```

### field-name (required)
Defines the key of the field whose value should replace the placeholder.

* Nested fields can be specified using periods (`.`) to denote hierarchy.
  * E.g., the field `{"a:" {"b": 0}}` may be denoted by `a.b`.
* Auto-generated fields in a
[Key-Value Pair IR Stream](https://docs.yscope.com/clp/main/dev-guide/design-key-value-pair-ir-stream.html)
can be specified using `@` as a prefix.
  * E.g., the auto-generated field `ts` may be denoted by `@ts`.
* Field names can contain any character, except the following characters must be escaped with a
  backslash:
  * `.`
  * `@`
  * `{`
  * `}`
  * `:`
  * `\`

### formatter-name (optional)
The name of the formatter to apply to the value before inserting it into the string.

* Formatter names can contain any character except a space (` `), and the following characters must
  be escaped with a backslash (`\`):
  * `{`
  * `}`
  * `:`
  * `\`

### formatter-options (optional)
Defines any options for the formatter denoted by `formatter-name`.

* Formatter options can contain any character, except the following characters must be escaped with
  a backslash:
  * `{`
  * `}`
  * `:`
  * `\`

:::{note}
`formatter-options` can only be specified if `formatter-name` was specified.
:::

## Implicit trailing newline

Every format string contains an implicit trailing newline so that each formatted log event ends with
a newline.

## Examples

### JSON Example

Consider the following JSON log event:
```
{
  "ts": 1427153388942,
  "level": "INFO",
  "thread": 0,
  "latency": {
    "msecs": 56400,
    "secs": 56.4,
  },
  "an.odd.key{name}": "org.apache.hadoop.metrics2.impl.MetricsConfig: loaded properties from hadoop-metrics2.properties"
}
```

We can format this using the following YScope format string:

```
{ts:timestamp:YYYY-MM-DD HH\:mm\:ss.SSS} {level} \{{thread}\} latency={latency.secs:round} {an\.odd\.key\{name\}}
```

* In the first placeholder, we have the field name `ts`, a formatter called `timestamp`, and
  the formatter's options which are a date format string.
* The second and third placeholders simply stringify the values of the given fields.
* The fourth placeholder uses the `round` formatter to round a nested field's value; this
  placeholder doesn't specify any formatter options, so the defaults will be used.
* The fifth placeholder is for a field whose name contains characters that require escaping.

The formatted string will be:
```
2015-03-23 19:29:48.942 INFO {0} latency=56 org.apache.hadoop.metrics2.impl.MetricsConfig: loaded properties from hadoop-metrics2.properties
```

### Key-Value Pair IR Example

Consider the following Key-Value Pair IR log event:
```
{
  "auto-generated": {
    "ts": 1741371422000
  },
  "user-generated": {
    "message": "Callback registered to fire in 5 seconds:",
    "ts": 1741371427000
  }
}
```

We can format this using the following YScope format string:

```
{@ts:timestamp} {message} {ts:timestamp}
```

* In the first placeholder, we have the auto-generated field name `@ts`. The `@` prefix
  specifies the field is from the auto-generated namespace.
* The second and third placeholders refer to the message and timestamp fields in the
  user-generated namespace, respectively.

The formatted string will be:
```
2025-03-07T18:17:02Z Callback registered to fire in 5 seconds: 2025-03-07T18:17:07Z
```

For a list of currently supported formatters, see [Formatters](format-struct-logs-formatters).