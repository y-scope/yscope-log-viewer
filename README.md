# YScope Log Viewer

![Open bug reports][bugs-shield]
![Open feature requests][feature-requests-shield]
![CLP on Zulip][zulip-shield]

The YScope Log Viewer is a tool that can be used to view log files. It currently supports
[CLP][clp-repo]'s compressed log files (IR streams) and JSON log files. The viewer can be used to
navigate the log file, filter by log level, view the logs with syntax highlighting, and generate
direct links to specific log events.

See the [demo](#demo) section to try the log viewer on a sample log file. Or you can generate your
own compressed log files using one of our [libraries][docs-site/generating-ir-stream-logs].

Want to report a bug or request a feature? Check out the [feedback](#providing-feedback) section.
A list of [features in development][docs-site/features-in-development] is available on our
[docs site][docs-site].

# Demo

A demo of the viewer available [here][online-demo].

* The demo loads a Hadoop YARN log file from the [hive-24hrs] log dataset.
  * More info on the dataset and other datasets can be found [here][datasets].
* To open an IR stream, drag and drop it onto the log viewer or use the open file dialog.

# Docs

The log viewer's docs are available [here][docs-site].

# Providing feedback

You can use GitHub issues to [report a bug][bug-report] or [request a feature][feature-req].

Join us on [Zulip][zulip] to chat with developers and other community members.

# Contributing

See the docs in our [developer guide][docs-site/dev-guide].

[bug-report]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=bug&template=bug-report.yml
[bugs-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/bug?label=bugs
[clp-repo]: https://github.com/y-scope/clp
[datasets]: https://docs.yscope.com/clp/main/user-guide/resources-datasets
[docs-site]: https://docs.yscope.com/yscope-log-viewer/main/
[docs-site/building]: https://docs.yscope.com/yscope-log-viewer/main/dev-guide/building-getting-started
[docs-site/dev-guide]: https://docs.yscope.com/yscope-log-viewer/main/dev-guide/index
[docs-site/features-in-development]: https://docs.yscope.com/yscope-log-viewer/main/index#features-in-development
[docs-site/generating-ir-stream-logs]: https://docs.yscope.com/yscope-log-viewer/main/index#generating-ir-stream-logs
[feature-req]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=enhancement&template=feature-request.yml
[feature-requests-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/enhancement?label=feature-requests
[hive-24hrs]: https://zenodo.org/records/7094921#.Y5JbH33MKHs
[online-demo]: https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst
[zulip]: https://yscope-clp.zulipchat.com/
[zulip-shield]: https://img.shields.io/badge/zulip-yscope--clp%20chat-1888FA?logo=zulip
