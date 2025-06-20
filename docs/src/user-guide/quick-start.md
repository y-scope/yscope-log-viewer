# Viewing logs

The log viewer can open local or remote log files. The viewer currently supports viewing [CLP] IR
and [JSONL] log files.

## Opening local log files
To open a local file, click the folder icon ({far}`folder`) in the top-left corner. This will open a file
browser where you can navigate to and select the log file to open.

## Opening remote log files
To open a remote file, append `/?filePath=<FILE_URL>` to the current URL, replacing `<FILE_URL>`
with the URL of your log file.

For complete documentation of all URL parameters, see the [URL Parameters](url-parameters) guide.

[CLP]: https://github.com/y-scope/clp
[JSONL]: https://jsonlines.org/
