# Viewing logs

The log viewer can open local or remote log files. The viewer currently supports viewing [CLP] IR
and [JSONL] log files.

## Opening local log files
To open a local file, click the folder icon ({far}`folder`) in the top-left corner. This will open a
file browser where you can navigate to and select the log file to open.

## Opening remote log files
To open a remote file, append `/?filePath=<FILE_URL>` to the current URL, replacing `<FILE_URL>`
with the URL of your log file. The `<FILE_URL>` can be directly supplied without being URL encoded,
even if it contains any search parameters for authentication purposes for example, because the
viewer expects `filePath` to always be the last search parameter in the viewer's URL. However, if
the `<FILE_URL>` contains a hash parameter, the whole URL should be URL-encoded to avoid ambiguity
of ownership of the hash parameter.

[CLP]: https://github.com/y-scope/clp
[JSONL]: https://jsonlines.org/
