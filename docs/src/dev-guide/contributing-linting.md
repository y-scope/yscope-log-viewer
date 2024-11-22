# Linting

Before submitting a PR, ensure you've run our linting tools and either fixed any violations or
suppressed the warning. If you can't run the linting workflows locally, you can enable and run the
[gh-workflow-lint] workflow in your fork.

## Requirements

To run the linting tools, you'll need to install the dependencies as specified in [Building]
(building).

## Running the linters

To perform the linting checks:

```shell
task lint:check
```

To also apply any automatic fixes:

```shell
task lint:fix
```

[feature-req]: https://github.com/y-scope/clp/issues/new?assignees=&labels=enhancement&projects=&template=feature-request.yml
[gh-workflow-lint]: https://github.com/y-scope/yscope-log-viewer/blob/main/.github/workflows/lint.yaml
[Task]: https://taskfile.dev/
