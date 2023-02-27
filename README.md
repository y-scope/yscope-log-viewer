# YScope Log Viewer

[![Open bug reports](https://img.shields.io/github/issues/y-scope/yscope-log-viewer/bug?label=bugs)](https://github.com/y-scope/yscope-log-viewer/issues?q=is%3Aissue+is%3Aopen+label%3Abug)
[![Open feature requests](https://img.shields.io/github/issues/y-scope/yscope-log-viewer/enhancement?label=feature-requests)](https://github.com/y-scope/yscope-log-viewer/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
[![CLP on Zulip](https://img.shields.io/badge/zulip-yscope--clp%20chat-1888FA?logo=zulip)](https://yscope-clp.zulipchat.com/)

`yscope-log-viewer` is a tool that can be used to view log files that were 
compressed using [CLP](https://github.com/y-scope/clp)'s IR stream format. The 
viewer can be used to navigate the log file, filter by log level, pretty print 
the logs and generate direct links to specific log events. 

See the [features in development](#features-in-development) section for upcoming
features.

# Online Demo

* A demo of the log viewer can be found at https://yscope.com/log-viewer
* The demo loads a Hadoop YARN log file from the 
  [hive-24hrs](https://zenodo.org/record/7094921#.Y5JbH33MKHs) log dataset. 
  * More info on the dataset and other datasets can be found 
    [here](https://github.com/y-scope/clp/blob/main/docs/Datasets.md).
* To open an IR stream, drag and drop it onto the log viewer or use the open 
  file dialog.

# Generating IR Stream Logs

IR stream log files can currently be generated using these libraries:

* [Python Logging Library](https://github.com/y-scope/clp-loglib-py)
* [Log4j Logging Library](https://github.com/y-scope/log4j1-appenders)
* Golang Logging Library (in development)

# Providing Feedback

You can use GitHub issues to [report a bug](https://github.com/y-scope/yscope-log-viewer/issues/new?assignees=&labels=bug&template=bug-report.yml)
or [request a feature](https://github.com/y-scope/yscope-log-viewer/issues/new?assignees=&labels=enhancement&template=feature-request.yml).

Join us on [Zulip](https://yscope-clp.zulipchat.com/) to chat with developers
and other community members.

# Developing `yscope-log-viewer`

* Clone the repo to get a copy of the code for development

  ```shell
  git clone https://github.com/yscope/yscope-log-viewer.git
  cd yscope-log-viewer
  ```

* Install Node.js using a [release](https://nodejs.org/en/) or via 
  [nvm](https://github.com/nvm-sh/nvm)
* Install the dependencies:

  ```shell
  $ npm install
  ```

* Run the development server:

  ```shell
  $ npm start
  ```

* The application should now be served at http://localhost:3010. 

# Distribute

To create a build, run the following command and the build will be placed in the
`dist` folder:

```shell
$ npm run build
```

# How does it work?

`yscope-log-viewer` is written using the ReactJS framework and uses the open 
source [monaco-editor](https://github.com/microsoft/monaco-editor).

To open IR stream files, the viewer spawns workers to do the following:

* Decompress the Zstd-compressed file
* Build an index of log events
* Paginate the indexed logs based on the number of log events per page
* Decode the CLP-encoded log data as needed

Once the worker decompresses, decodes, and extracts logs, the viewer UI can be 
used to navigate the log. Tasks are passed to the worker as needed and changes 
are rendered to the UI. 

# Validation

Currently, there is no automated testing to verify that changes don't cause 
bugs. While this is being developed, the following tests can be run manually:

* Verify that the following features work:
  * Changing the number of events per page
  * Navigating to the first/last/next/previous page
  * Loading a log file using the open file dialog and dragging & dropping
  * Copying a link to a log event
  * Change the log level
  * Prettifying logs 
  * Using the keyboard shortcuts
* Perform a build and verify that all features are functional

# Features in Development

* Dashboard to visualize distribution of log types and log levels
* Opening log files which are larger than 2 GB when uncompressed
* Support for plain text, archived log files, and other requested formats
* Search across file, multiple files or within provided time ranges
* Infinite scrolling instead of using pagination
* Log correlation with sync by timestamp across multiple editors
* Automatic conversion of text log files to IR stream format in the browser
* Deployment of components via NPM
