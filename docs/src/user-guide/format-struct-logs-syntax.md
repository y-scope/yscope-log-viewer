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
* Field names can contain any character, except the following characters must be escaped with a
  backslash:
  * `.`
  * `$`
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
Consider the following log event:
```
{
  "@timestamp": 1427153388942,
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
{@timestamp:timestamp:YYYY-MM-DD HH\:mm\:ss.SSS} {level} \{{thread}\} latency={latency.secs:round} {an\.odd\.key\{name\}}
```

* In the first placeholder, we have the field name `@timestamp`, a formatter called `timestamp`, and
  the formatter's options which are a date format string.
* The second and third placeholders simply stringify the values of the given fields.
* The fourth placeholder uses the `round` formatter to round a nested field's value; this
  placeholder doesn't specify any formatter options, so the defaults will be used.
* The fifth placeholder is for a field whose name contains characters that require escaping.

The formatted string will be:
```
2015-03-23 19:29:48.942 INFO {0} latency=56 org.apache.hadoop.metrics2.impl.MetricsConfig: loaded properties from hadoop-metrics2.properties
```

For a list of currently supported formatters, see [Formatters](format-struct-logs-formatters).
