# Validation

## Automated Testing

With the recent addition of a Jest test framework, users can validate the project either by running
tests locally or using the GitHub Action Workflow. Both methods ensure the same level of testing and
validation, allowing you to choose the approach that fits your workflow.

### Locally

Run `npm run test` to execute the tests locally. This will:

* Find tests under `<projectRoot>/test`.
* Enforce line and function coverage thresholds at directory levels.
* Output detailed results, including any coverage issues.

### GitHub Workflow

Push your changes to a branch and let the [GitHub Action Workflow][gh-worflow-test] execute the
tests automatically. This workflow:

* Runs the same Jest tests and enforces coverage thresholds.
* Reports results and issues as GitHub Annotations for easier navigation in the GitHub web UI.

## Manual Testing

While automated testing now covers some aspects of the project, the following features should still
be tested manually:

* Verify that the following features work:
  * Changing display themes
  * Changing the number of events per page
  * Navigating to the first/last/next/previous page
  * Loading a log file using the open file dialog and dragging & dropping
  * Copying a link to a log event
  * Changing the log level filter
  * Exporting all logs to a file
  * Toggling tabbed panels in the sidebar
  * Using keyboard shortcuts
* Perform a build and verify that all features are functional

[gh-worflow-test]: https://github.com/y-scope/yscope-log-viewer/blob/main/.github/workflows/lint.yaml
