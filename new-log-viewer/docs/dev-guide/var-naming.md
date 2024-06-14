# Variable naming

To differentiate variables that use different starting indexes (0 vs. 1), we use the following
naming convention:

* 0-based indexing variable names end with the suffix `Idx`
* 1-based indexing variable names end with the suffix `Num`

Similarly, variables that represent a total number of items are named with the prefix `num`.

Examples:

* `logEventNum` for a 1-based indexing variable.
* `arrayIndexIdx` for a 0-based indexing variable.
* `numEvents` for the total number of events.
 