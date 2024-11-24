# Linting

Before submitting a pull request, ensure you've run our linting tools and either fixed any
violations or suppressed the warning. If you can't run the linting workflows locally, you can enable
and run the [lint][gh-workflow-lint] GitHub workflow in your fork.

## Requirements

To run the linting tools, you'll need to install the dependencies as specified in
[Building](building-getting-started).

## Running the linters

To run all linting checks:

```shell
npm run lint:check
```

To run all linting checks AND automatically fix any fixable issues:

```shell
npm run lint:fix
```

[feature-req]: https://github.com/y-scope/clp/issues/new?assignees=&labels=enhancement&projects=&template=feature-request.yml
[gh-workflow-lint]: https://github.com/y-scope/yscope-log-viewer/blob/main/.github/workflows/lint.yaml
[Task]: https://taskfile.dev/
