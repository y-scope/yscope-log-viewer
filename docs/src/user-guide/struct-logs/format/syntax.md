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
{<field-key>[:<formatter-name>[:<formatter-options>]]}
```

### field-key (required)
Defines the key of the field whose value should replace the placeholder.

:::{include} ../key-syntax.md
:::

### formatter-name (optional)
The name of the formatter to apply to the value before inserting it into the string.

* Formatter names can contain any character except a space (` `), and the following characters must
  be escaped with a backslash (`\`):
  * `{`
  * `}`
  * `:`
  * `\`

For a list of currently supported formatters, see [Formatters](formatters).

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

### Formatting JSON logs events

Consider the following JSON log event:
```json
{
  "ts": 1427153388942,
  "level": "INFO",
  "thread": 0,
  "latency": {
    "msecs": 56400,
    "secs": 56.4
  },
  "@an.odd.key{name}": "org.apache.hadoop.metrics2.impl.MetricsConfig: loaded properties from hadoop-metrics2.properties"
}
```

We can format this using the following format string:

```
{ts:timestamp:YYYY-MM-DD HH\:mm\:ss.SSS} {level} \{{thread}\} latency={latency.secs:round} {\@an\.odd\.key\{name\}}
```

* In the first placeholder, we have the field key `ts`, a formatter called `timestamp`, and the
  formatter's options which are a date format string.
* The second and third placeholders simply stringify the values of the given fields.
* The fourth placeholder uses the `round` formatter to round a nested field's value; this
  placeholder doesn't specify any formatter options, so the defaults will be used.
* The fifth placeholder is for a field whose name contains characters that require escaping.

The formatted string will be:
```
2015-03-23 19:29:48.942 INFO {0} latency=56 org.apache.hadoop.metrics2.impl.MetricsConfig: loaded properties from hadoop-metrics2.properties
```

### Formatting kv-pair IR log events

Consider the following kv-pair IR log event:

:::{note}
In the example below, for simplicity, we render the log event as JSON with the auto-generated
kv-pairs under the `auto-generated` key, and the user-generated kv-pairs under the `user-generated`
key, but these keys don't exist in the log event.
:::

```json
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

We can format this using the following format string:

```
{@ts:timestamp} {message} {ts:timestamp}
```

* In the first placeholder, we have the auto-generated field key `@ts`. The `@` prefix specifies
  that the field is from the auto-generated namespace.
* The second and third placeholders refer to the `message` and `ts` fields in the user-generated
  namespace.

The formatted string will be:
```
2025-03-07T18:17:02Z Callback registered to fire in 5 seconds: 2025-03-07T18:17:07Z
```
