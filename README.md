# YScope Log Viewer

![Open bug reports][bugs-shield]
![Open feature requests][feature-requests-shield]
![CLP on Zulip][zulip-shield]

`yscope-log-viewer` is a tool that can be used to view log files. It currently
supports [CLP][clp-repo]'s compressed log files (IR streams) and JSON log files.
The viewer can be used to navigate the log file, filter by log level, view the
logs with syntax highlighting, and generate direct links to specific log events.

To start a local server for accessing the application locally, refer to our
[build guide](docs/dev-guide/building.md).

See the [features in development](#features-in-development) section for upcoming
features.

# Online Demo

* A demo of the log viewer can be found at https://yscope.com/log-viewer
* The demo loads a Hadoop YARN log file from the [hive-24hrs] log dataset.
  * More info on the dataset and other datasets can be found [here][datasets].
* To open an IR stream, drag and drop it onto the log viewer or use the open
  file dialog.

# Generating IR Stream Logs

IR stream log files can currently be generated using these libraries:

* [Log4j Logging Library][log4j1-appenders]
* [Logback Logging Library][logback-appenders]
* [Python Logging Library][clp-loglib-py]
* Golang Logging Library (in development)

# How does it work?

The log viewer is written using the ReactJS framework and uses the open source
[monaco-editor] and [clp-ffi-js].

The viewer spawns a worker to assist with computationally intensive tasks such
as:

* Deserializing the file and creating an index of logs events.
* Paginating the indexed logs.
* Decoding the deserialized log events into plain text.

Tasks are passed to the worker as needed and changes are rendered in the UI.

# Providing Feedback

You can use GitHub issues to [report a bug][report-bug] or
[request a feature][request-feature].

Join us on [Zulip][zulip] to chat with developers and other community members.

# Contributing

See the docs in our [developer guide](docs/dev-guide).

# Features in Development

* Pretty printing to enhance the readability of structured data in the logs.
* A dashboard to visualize the distribution of log types and log levels.
* Support for plain text, archived log files, and other requested formats.
* Searching within a file, multiple files, or within provided time ranges.
* Infinite scrolling instead of pagination.
* Log correlation with sync by timestamp across multiple editors.
* Automatic conversion of text log files to IR stream format in the browser.
* Deployment of components via NPM.

[bugs-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/bug?label=bugs
[clp-ffi-js]: https://github.com/y-scope/clp-ffi-js
[clp-loglib-py]: https://github.com/y-scope/clp-loglib-py
[clp-repo]: https://github.com/y-scope/clp
[datasets]: https://docs.yscope.com/clp/main/user-guide/resources-datasets
[feature-requests-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/enhancement?label=feature-requests
[hive-24hrs]: https://zenodo.org/record/7094921#.Y5JbH33MKHs
[log4j1-appenders]: https://github.com/y-scope/log4j1-appenders
[logback-appenders]: https://github.com/y-scope/logback-appenders
[monaco-editor]: https://microsoft.github.io/monaco-editor/
[report-bug]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=bug&template=bug-report.yml
[request-feature]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=enhancement&template=feature-request.yml
[zulip]: https://yscope-clp.zulipchat.com/
[zulip-shield]: https://img.shields.io/badge/zulip-yscope--clp%20chat-1888FA?logo=zulip
