# Format String Syntax

- The format string is composed of arbitrary (“static”) text and field placeholders enclosed in
  braces (`{` and `}`).
    - Each brace or backslash in the static text must be escaped by a backslash.
- Each field placeholder has the following form, consisting of three components (contained in
  braces):

    ```
    {<field-name>[:<formatter-name>[:<formatter-options>]]}
    ```

    - `field-name` (required) defines the key of the field whose value should replace the
      placeholder.
        - Nested fields can be specified using periods (`.`) to denote hierarchy. E.g., the field
          `{"a:" {"b": 0}}` may be denoted by `a.b`.
        - Field names can contain any character except that each period, dollar sign, brace (left
          or right), colon, or backslash must be escaped with a backslash.
    - `formatter-name` (optional, unless `formatter-options` is specified) is the name of the
      formatter to apply to the value before inserting it into the string.
        - Formatter names can contain any character except a space (’ ‘) while each brace (left or
          right), colon, or backslash must be escaped with a backslash.
    - `formatter-options` (optional) defines any options for the formatter denoted by
      `formatter-name`.
        - Formatter options can contain any character except each brace (left or right), colon, or
          backslash must be escaped with a backslash.
- Finally, every format string contains an implicit trailing newline so that each formatted log
  event ends with a newline.

For example, consider the following log event:

```
{
    "@timestamp": 1427153388942,
    "level": "INFO",
    "thread": 0,
    "latency_secs": 56.4,
    "an.odd.key{name}": "org.apache.hadoop.metrics2.impl.MetricsConfig: loaded properties from
    hadoop-metrics2.properties"
}
```

We can format this using the following YScope format string:

```
{@timestamp:timestamp:YYYY-MM-DD HH\:MM\:ss.SSS} {level} \{{thread}\} latency={latency_secs:round}
{an\.odd\.key\{name\}}
```

- In the first placeholder, we have the field name `ts`, a formatter called `timestamp`, and the
  formatter’s options which are a date format string.
- The second and third placeholders simply stringify the values of the given fields.
- The fourth placeholder uses the `round` formatter to round the field’s value; this placeholder
  doesn’t specify any formatter options, so the defaults will be used.
- The fifth placeholder is for a field whose name contains characters that require escaping.

The formatted string will be:

```
2015-03-23 19:29:48.942 INFO {0} latency=56 org.apache.hadoop.metrics2.impl.MetricsConfig: loaded
properties from hadoop-metrics2.properties
```

For a list of currently supported formatters, see [Formatters](format-string-formatters).