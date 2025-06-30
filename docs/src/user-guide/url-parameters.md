# URL parameters

The log viewer supports various URL parameters to control its behavior and state. The parameters are
divided into two categories:

- **Search parameters** (after `?`).
- **Hash parameters** (after `#`).

## Search parameters

Search parameters appear after the `?` in the URL, and manual modification in the browser address
bar causes the page to reload. Such parameters are used to initialize the log viewer.

| Parameter  | Type   | Default | Description                               | Example                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------|--------|---------|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filePath` | String | ""      | Specifies the log file to load on startup | `?filePath=https://example.com/app-log.clp.zst` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst">https://y-scope.github.io/yscope-log-viewer/?<b>filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst</b></a></details> |

**Notes for filePath:**
- Can be a local file URL or remote HTTP(S) URL.
- If the file URL is not [percent-encoded][rfc-3986-percent-encoding] as per RFC 3986, it must be
  the last parameter to prevent ambiguity with other log viewer search parameters. To include hash
  parameters in the file URL, percent-encode the entire URL.
- Is automatically converted to absolute URL if a relative path is provided.

## Hash parameters

Hash parameters appear after the `#` in the URL, and can be manually modified in the browser address
bar without triggering a page reload. Such parameters are used to control the log viewer's state.

| Parameter              | Type    | Default | Description                                                           | Example                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|------------------------|---------|---------|-----------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `isPrettified`         | Boolean | false   | Enable/disable pretty printing of log content                         | `#isPrettified=true` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#isPrettified=true">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#<b>isPrettified=true</b></a></details>                                                           |
| `logEventNum`          | Number  | 0       | Navigate to a specific log event (1-based index)                      | `#logEventNum=1542` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#logEventNum=1542">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#<b>logEventNum=1542</b></a></details>                                                              |
| `queryString`          | String  | ""      | Set search query text                                                 | ```#queryString=service%3A+172.31``` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#queryString=service%3A+172.31">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#<b>queryString=service%3A+172.31</b></a></details>                   |
| `queryIsCaseSensitive` | Boolean | false   | Enable/disable case-sensitive search                                  | `#queryIsCaseSensitive=true`   <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#queryString=RMC&queryIsCaseSensitive=true">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#queryString=RMC&<b>queryIsCaseSensitive=true</b></a></details> |
| `queryIsRegex`         | Boolean | false   | Enable/disable regular expression search         <br/><br/><br/><br/> | `#queryIsRegex=true` <details><summary>Demo</summary><a href="https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#queryString=172.*43716&queryIsRegex=true">https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#queryString=172.*43716&<b>queryIsRegex=true</b></a></details>             |

**Notes for hash parameters:**
- `logEventNum` starts from 1 (first log event is `1`, not `0`).
- Moving the cursor in the editor automatically updates `logEventNum` in the URL.
  :::{note}
  This behavior is under review and may be removed in future versions.
  :::

## Other parameter behaviors

- Boolean values should use `true`/`false` strings.
- Empty or falsy values are automatically removed from the URL.


[rfc-3986-percent-encoding]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.1