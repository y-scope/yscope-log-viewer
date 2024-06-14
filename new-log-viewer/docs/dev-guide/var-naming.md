# Variable naming

For variables that are used to index log events, we use two different naming conventions based on
the starting index:

* 1-based indexing variable names end with the prefix `Num`
* 0-based indexing variable names end with the prefix `Idx`
 
For example, when referencing log events through a URL, we use 1-based indexing, so the related
variable names end with `Num`.
