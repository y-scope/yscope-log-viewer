# Variable naming

To differentiate variables that use different starting indexes (0 vs. 1), we use the following
naming convention:

* 1-based indexing variable names end with the suffix `Num`
* 0-based indexing variable names end with the suffix `Idx`

Similarly, variables that represent a total number of items are named with a prefix "num".

For example:

* logEventNum for a 1-based indexing variable.
* arrayIndexIdx for a 0-based indexing variable.
* numEvents for the total number of events.
 
For example, when referencing log events through a URL, we use 1-based indexing, so the related
variable names end with `Num`.
