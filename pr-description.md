<!-- markdownlint-disable MD012 -->

<!--
Set the PR title to a meaningful commit message that:

* is in imperative form.
* follows the Conventional Commits specification (https://www.conventionalcommits.org).
  * See https://github.com/commitizen/conventional-commit-types/blob/master/index.json for possible
    types.

Example:

fix: Don't add implicit wildcards ('*') at the beginning and the end of a query (fixes #390).
-->

fix(prettify): Use prettified message's line count for log event index mapping (fixes #402).

# Description

Fix incorrect line navigation when clicking search results while Prettify mode is enabled. The bug was in `LogFileManager.loadPage()`, where the `beginLineNumToLogEventNum` map was built using the raw message's line count (`message.split("\n").length`) instead of the prettified message's line count (`printedMsg.split("\n").length`). Since prettified messages typically span more lines than the originals, the map's line number keys were too small for events after the first one, causing incorrect Log Event index display in the status bar.

# Checklist

* [x] The PR satisfies the [contribution guidelines][yscope-contrib-guidelines].
* [x] This is a breaking change and that has been indicated in the PR title, OR this isn't a
  breaking change.
* [x] Necessary docs have been updated, OR no docs need to be updated.

# Validation performed

- TypeScript type-check (`npx tsc --noEmit`) passes with no errors.
- Verified in browser with `cockroachdb.clp.zst` and `isPrettified=true`: clicked different lines in the editor body and confirmed the log event index in the status bar matches correctly; previously there were misalignments between the displayed line and the event index, which are now fixed.

[yscope-contrib-guidelines]: https://docs.yscope.com/dev-guide/contrib-guides-overview.html
