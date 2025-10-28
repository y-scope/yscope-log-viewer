# URL parameters

The log viewer supports various URL parameters to control its behavior and state. The parameters are
divided into two categories:

- **[Search parameters](#search-parameters)** (after `?`).
- **[Hash parameters](#hash-parameters)** (after `#`).

## General rules

- Boolean values should use `true`/`false` strings.
- If empty or falsy values are provided, the log-viewer will remove them from the URL on load.

## Search parameters

Search parameters appear after the `?` in the URL. When the page loads, the viewer reads these
parameters to set its initial state.

:::{note}
Modifying search parameters causes the page to reload.
:::

| Parameter  | Type   | Default | Description                               | Example                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------|--------|---------|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filePath` | String | ""      | Specifies the log file to load on startup | `?filePath=https://example.com/app-log.clp.zst` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst">https://y-scope.github.io/yscope-log-viewer/?<b>filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst</b></a></details> |

Below are some important details to be aware of when you're working with search parameters.

- A `filePath` value can be a local file URL or remote HTTP(S) URL.
- If a `filePath` URL isn't [percent-encoded][rfc-3986-percent-encoding] as per RFC 3986, it must be
  the last parameter to prevent ambiguity with other log viewer search parameters. To include hash
  parameters in a URL, percent-encode the entire URL.
- Relative `filePath` values are automatically converted to absolute URLs, e.g.,
  `http://localhost:3010/?filePath=/test/app.clp.zst` downloads the file from
  `http://localhost:3010/test/app.clp.zst`.

## Hash parameters

Hash parameters appear after the `#` in the URL, and are used to control the log viewer's state.

:::{note}
Modifying hash parameters does NOT cause the page to reload.
:::

| Parameter              | Type    | Default | Description                                        | Example                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------------------------|---------|---------|----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `isPrettified`         | Boolean | false   | Enable/disable pretty printing of log content      | `#isPrettified=true` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/cockroachdb.clp.zst#isPrettified=true">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/cockroachdb.clp.zst#<b>isPrettified=true</b></a></details>                                                                                                                                 |
| `logEventNum`          | Number  | 0       | Navigate to a specific log event (1-based index)   | `#logEventNum=1542` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#logEventNum=1542">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#<b>logEventNum=1542</b></a></details>                                                      |
| `filter`                | String  | ""      | Set KQL log filter for kv-pair IR logs             | `#filter=%40timestamp+%3C+1679969692` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/cockroachdb.clp.zst#filter=%40timestamp+%3C+1679969692">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/cockroachdb.clp.zst#filter=%40timestamp+%3C+1679969692</a></details>                                                                                        |
| `search`             | String  | ""      | Set search query string                            | `#search=service%3A+172.31` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#search=service%3A+172.31">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#<b>search=service%3A+172.31</b></a></details>                        |
| `searchIsCaseSensitive` | Boolean | false   | Enable/disable case-sensitive search               | `#searchIsCaseSensitive=true` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#search=RMC&searchIsCaseSensitive=true">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#search=RMC&<b>searchIsCaseSensitive=true</b></a></details> |
| `searchIsRegex`         | Boolean | false   | Enable/disable regular expression search           | `#searchIsRegex=true` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#search=172.*43716&searchIsRegex=true">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#search=172.*43716&<b>searchIsRegex=true</b></a></details>           |
| `timestamp`            | Number  | -1      | Navigate to the log event closest to the timestamp | `#timestamp=1427103813827` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#timestamp=1427103813827">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#<b>timestamp=1427103813827</b></a></details>                                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

Below are some important details to be aware of when you're working with hash parameters.

- `logEventNum` is a 1-based index with a default value of `0`, indicating no specific log event is
  selected. When `0`, the log viewer loads the page containing the most recent log event.
- Moving the cursor in the editor automatically updates `logEventNum` in the URL.

  :::{note}
  This behavior is under review and may be removed in future versions.
  :::

- `timestamp` is in milliseconds since the Unix epoch, with a default value of `-1`. We do not
  support negative timestamps.
- When both `logEventNum` and `timestamp` are specified, `timestamp` takes precedence. We strongly
  recommend that you do not specify both parameters simultaneously.
- Timestamp navigation behavior:
  - If the log contains at least one exact match for the specified timestamp, the viewer navigates
    to the most recent match.
  - If no exact match exists, the viewer navigates to the log event closest to and before the
    specified timestamp, unless all log events are after the specified timestamp. In this case, the
    viewer navigates to the first log event.

[rfc-3986-percent-encoding]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.1
