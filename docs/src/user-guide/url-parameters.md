# URL Parameters

The YScope Log Viewer supports various URL parameters to control its behavior and state. The 
parameters are divided into two categories:

- **Search parameters** (after `?`).
- **Hash parameters** (after `#`).

## Search Parameters

Search parameters appear after the `?` in the URL, and manual modification in the browser address
bar causes the page to reload. Such parameters are used to initialize the log viewer.

| Parameter | Type | Default | Description | Example                                         |
|-----------|------|---------|-------------|-------------------------------------------------|
| `filePath` | String | "" | Specifies the log file to load on startup | `?filePath=https://example.com/app-log.clp.zst` |

**Notes for filePath:**
- Can be a local file URL or remote HTTP(S) URL.
- If the file URL is not [percent-encoded][rfc-3986-percent-encoding] as per RFC 3986, it must be
  the last parameter to prevent ambiguity with other log viewer search parameters. To include hash
  parameters in the file URL, percent-encode the entire URL.
- Is automatically converted to absolute URL if a relative path is provided.

## Hash Parameters

Hash parameters appear after the `#` in the URL, and can be manually modified in the browser address
bar without triggering a page reload. Such parameters are used to control the log viewer's state.

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `isPrettified` | Boolean | false | Enable/disable pretty printing of log content | `#isPrettified=true` |
| `logEventNum` | Number | 0 | Navigate to a specific log event (1-based index) | `#logEventNum=1542` |
| `queryString` | String | "" | Set search query text | `#queryString=error+database` |
| `queryIsCaseSensitive` | Boolean | false | Enable/disable case-sensitive search | `#queryIsCaseSensitive=true` |
| `queryIsRegex` | Boolean | false | Enable/disable regular expression search | `#queryIsRegex=true` |

**Notes for hash parameters:**
- `logEventNum` starts from 1 (first log event is `1`, not `0`).
- Moving the cursor in the editor automatically updates `logEventNum` in the URL.
  :::{note}
  This behavior is under review and may be removed in future versions.
  :::

## Combined Examples

**Load file and navigate to specific event:**

https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#logEventNum=1000

**Load file with search query:**

https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#queryString=IllegalArgumentException&queryIsCaseSensitive=true

**Complete example with all parameters:**

https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst#logEventNum=1000&queryString=IllegalArgumentException&queryIsCaseSensitive=true

## Other parameter behaviors

- Boolean values should use `true`/`false` strings.
- Empty or falsy values are automatically removed from the URL.


[rfc-3986-percent-encoding]: https://datatracker.ietf.org/doc/html/rfc3986#section-2.1