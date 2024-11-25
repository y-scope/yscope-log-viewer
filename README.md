# YScope Log Viewer

![Open bug reports][bugs-shield]
![Open feature requests][feature-requests-shield]
![CLP on Zulip][zulip-shield]

`yscope-log-viewer` is a tool that can be used to view log files. It currently
supports [CLP][clp-repo]'s compressed log files (IR streams) and JSON log files.
The viewer can be used to navigate the log file, filter by log level, view the
logs with syntax highlighting, and generate direct links to specific log events.

See the [online demo](#online-demo) section to try out the log viewer on a
sample log file. To set up a local server, follow the
[build guide](docs/dev-guide/building.md).

See the [features in development](#features-in-development) section for upcoming
features.

# Online Demo

* A demo of the log viewer can be found [here][online-demo].
* The demo loads a Hadoop YARN log file from the [hive-24hrs] log dataset.
  * More info on the dataset and other datasets can be found [here][datasets].
* To open an IR stream, drag and drop it onto the log viewer or use the open
  file dialog.

# Providing Feedback

You can use GitHub issues to [report a bug][bug-report] or
[request a feature][feature-req].

Join us on [Zulip][zulip] to chat with developers and other community members.

# Contributing

See the docs in our [developer guide](docs/dev-guide).

[bug-report]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=bug&template=bug-report.yml
[bugs-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/bug?label=bugs
[clp-repo]: https://github.com/y-scope/clp
[datasets]: https://docs.yscope.com/clp/main/user-guide/resources-datasets
[feature-req]: https://github.com/y-scope/yscope-log-viewer/issues/new?labels=enhancement&template=feature-request.yml
[feature-requests-shield]: https://img.shields.io/github/issues/y-scope/yscope-log-viewer/enhancement?label=feature-requests
[hive-24hrs]: https://zenodo.org/records/7094921#.Y5JbH33MKHs
[online-demo]: https://y-scope.github.io/yscope-log-viewer/?filePath=https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst
[zulip]: https://yscope-clp.zulipchat.com/
[zulip-shield]: https://img.shields.io/badge/zulip-yscope--clp%20chat-1888FA?logo=zulip
