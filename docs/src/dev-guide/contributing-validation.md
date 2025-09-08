# Validation

## Automated testing

You can validate the project either by running tests locally or using the [test][gh-workflow-test]
GitHub Workflow in your fork.

### Running locally

```shell
npm run test
```

This will:

* Find and run any tests in the `test` directory.
* Enforce line and function coverage thresholds at directory levels.
* Output detailed results, including any coverage issues.

### Running using the GitHub Workflow

Once you push your to a branch in your fork, the [test][gh-workflow-test] GitHub workflow will
perform the same steps listed in the [Running locally](#running-locally) section, except results
and issues will be reported as GitHub Annotations.

## Manual testing

Since our automated testing only covers some aspects of the project, the following features should
still be tested manually:

* Perform a build and verify that all features are functional.
* In particular, verify that the following features work:
  * Changing display themes
  * Changing the number of events per page
  * Navigating to the first/last/next/previous page
  * Loading a log file using the open file dialog and dragging & dropping
  * Copying a link to a log event
  * Changing the log level filter
  * Exporting all logs to a file
  * Toggling tabbed panels in the sidebar
  * Using keyboard shortcuts
  * Toggling "Prettify" via the status bar button, the address bar (URL hash), and the Monaco action

[gh-workflow-test]: https://github.com/y-scope/yscope-log-viewer/blob/main/.github/workflows/test.yaml
