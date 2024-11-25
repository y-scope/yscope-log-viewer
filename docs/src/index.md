The YScope Log Viewer is a tool that can be used to view log files. It currently supports
[CLP][clp-repo]'s compressed log files (IR streams) and JSON log files. The viewer can be used to
navigate the log file, filter by log level, view the logs with syntax highlighting, and generate
direct links to specific log events.

See the [demo](#demo) section to try the log viewer on a sample log file. Or you can generate your
own compressed log files using one of our [libraries](#generating-ir-stream-logs).

Want to report a bug or request a feature? Check out the [feedback](#providing-feedback) section.
A list of [features in development](#features-in-development) is below.

# Getting started

Check out the relevant guide below, based on whether you'd like to use or develop the YScope Log
Viewer.

::::{grid} 1 1 2 2
:gutter: 2

:::{grid-item-card}
:link: user-guide/index
User guide
^^^
Docs for those interested in using the YScope Log Viewer.
:::

:::{grid-item-card}
:link: dev-guide/index
Developer guide
^^^
Docs for those interested in developing and contributing to the YScope Log Viewer.
:::
::::

# Demo

A demo of the viewer is available [here][online-demo].

* The demo loads a Hadoop YARN log file from the [hive-24hrs] log dataset.
  * More info on the dataset and other datasets can be found [here][datasets].
* To open an IR stream, drag and drop it onto the log viewer or use the open file dialog.

# Generating IR stream logs

IR stream log files can currently be generated using these libraries:

* [Log4j Logging Library][log4j1-appenders]
* [Logback Logging Library][logback-appenders]
* [Python Logging Library][clp-loglib-py]
* Golang Logging Library (in development)

# Providing feedback

You can use GitHub issues to [report a bug][bug-report] or [request a feature][feature-req].

Join us on [Zulip][zulip] to chat with developers and other community members.

# Features in development

* Pretty printing to enhance the readability of structured data in the logs.
* A dashboard to visualize the distribution of log types and log levels.
* Support for plain text, archived log files, and other requested formats.
* Searching within a file, multiple files, or within provided time ranges.
* Infinite scrolling instead of pagination.
* Log correlation with sync by timestamp across multiple editors.
* Automatic conversion of text log files to IR stream format in the browser.
* Deployment of components via NPM.

:::{toctree}
:hidden:

user-guide/index
dev-guide/index
:::

[bug-report]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=bug&template=bug-report.yml
[bugs-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/bug?label=bugs
[clp-loglib-py]: https://github.com/y-scope/clp-loglib-py
[clp-repo]: https://github.com/y-scope/clp
[datasets]: https://docs.yscope.com/clp/main/user-guide/resources-datasets
[feature-req]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=enhancement&template=feature-request.yml
[feature-requests-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/enhancement?label=feature-requests
[hive-24hrs]: https://zenodo.org/records/7094921#.Y5JbH33MKHs
[log4j1-appenders]: https://github.com/y-scope/log4j1-appenders
[logback-appenders]: https://github.com/y-scope/logback-appenders
[online-demo]: https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst
[zulip]: https://yscope-clp.zulipchat.com/
[zulip-shield]: https://img.shields.io/badge/zulip-yscope--clp%20chat-1888FA?logo=zulip
